import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { usersAPI } from '../../api/endpoints';
import '../Admin.css';

const decodeTokenPayload = (token) => {
  try {
    if (!token || token === 'undefined') return null;

    const parts = token.split('.');
    if (parts.length < 2) return null;

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(base64);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

const normalizeRole = (rawUser) => {
  const roleCandidates = [
    rawUser?.role,
    rawUser?.user_role,
    rawUser?.role_name,
    rawUser?.is_admin === true ? 'admin' : null,
    rawUser?.admin === true ? 'admin' : null,
  ];

  for (const candidate of roleCandidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.toLowerCase().includes('admin') ? 'admin' : 'user';
    }

    if (candidate === true) {
      return 'admin';
    }
  }

  return Number(rawUser?.role_id) === 1 ? 'admin' : 'user';
};

const normalizeUser = (rawUser) => ({
  id: Number(rawUser?.id ?? rawUser?.user_id ?? 0),
  email: rawUser?.email ?? rawUser?.user_email ?? '',
  full_name:
    rawUser?.full_name ??
    rawUser?.fullName ??
    rawUser?.name ??
    rawUser?.username ??
    '',
  role: normalizeRole(rawUser),
  raw: rawUser,
});

const getErrorMessage = (error) => {
  const detail = error?.response?.data?.detail;
  const message = error?.response?.data?.message;

  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map((item) => item?.msg || String(item)).join(', ');
  if (typeof message === 'string') return message;

  return 'Не удалось обновить роль пользователя';
};

export const AdminSettings = () => {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [roleDrafts, setRoleDrafts] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualRole, setManualRole] = useState('admin');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [savingUserId, setSavingUserId] = useState(null);
  const [savingManual, setSavingManual] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [notice, setNotice] = useState('');

  const sessionInfo = useMemo(() => {
    const token = localStorage.getItem('token');
    const payload = decodeTokenPayload(token);
    const exp = payload?.exp ? new Date(payload.exp * 1000) : null;
    const isExpired = exp ? exp.getTime() <= Date.now() : false;

    return {
      hasToken: Boolean(token && token !== 'undefined'),
      exp,
      isExpired,
    };
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      setUsersError('');

      const response = await usersAPI.getAll();
      const source = response?.data;
      const items = Array.isArray(source)
        ? source
        : source?.items || source?.users || source?.data || [];

      const normalizedUsers = items
        .map(normalizeUser)
        .filter((item) => item.id > 0)
        .sort((a, b) => a.email.localeCompare(b.email));

      setUsers(normalizedUsers);
      setRoleDrafts(
        normalizedUsers.reduce((acc, item) => {
          acc[item.id] = item.role;
          return acc;
        }, {})
      );
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
      const status = error?.response?.status;
      setUsersError(
        status === 404 || status === 405
          ? 'Бэкенд не отдаёт список пользователей. Ниже можно назначить роль вручную по email.'
          : getErrorMessage(error)
      );
      setUsers([]);
      setRoleDrafts({});
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((item) => {
      const name = String(item.full_name || '').toLowerCase();
      const email = String(item.email || '').toLowerCase();
      const role = String(item.role || '').toLowerCase();

      return (
        name.includes(query) ||
        email.includes(query) ||
        role.includes(query) ||
        String(item.id).includes(query)
      );
    });
  }, [searchQuery, users]);

  const stats = useMemo(() => {
    const admins = users.filter((item) => item.role === 'admin').length;

    return {
      total: users.length,
      admins,
      users: Math.max(users.length - admins, 0),
    };
  }, [users]);

  const handleRoleDraftChange = (userId, nextRole) => {
    setRoleDrafts((prev) => ({
      ...prev,
      [userId]: nextRole,
    }));
  };

  const handleSaveRole = async (targetUser) => {
    const nextRole = roleDrafts[targetUser.id] || targetUser.role;

    try {
      setSavingUserId(targetUser.id);
      setNotice('');
      await usersAPI.updateRole(targetUser.id, nextRole);

      setUsers((prev) =>
        prev.map((item) =>
          item.id === targetUser.id
            ? {
                ...item,
                role: nextRole,
              }
            : item
        )
      );

      setNotice(
        `${targetUser.email || 'Пользователь'} теперь ${nextRole === 'admin' ? 'администратор' : 'пользователь'}`
      );
    } catch (error) {
      console.error('Ошибка обновления роли:', error);
      setNotice(getErrorMessage(error));
    } finally {
      setSavingUserId(null);
    }
  };

  const handleManualAssign = async (e) => {
    e.preventDefault();

    if (!manualEmail.trim()) {
      setNotice('Укажи email пользователя');
      return;
    }

    try {
      setSavingManual(true);
      setNotice('');
      await usersAPI.updateRole({ email: manualEmail.trim() }, manualRole);
      setNotice(
        `${manualEmail.trim()} теперь ${manualRole === 'admin' ? 'администратор' : 'пользователь'}`
      );
      setManualEmail('');
      await loadUsers();
    } catch (error) {
      console.error('Ошибка назначения роли по email:', error);
      const status = error?.response?.status;
      setNotice(
        status === 404 || status === 405
          ? 'На бэкенде пока нет маршрута для смены роли по email. Нужен роут вроде POST /admin/users/role.'
          : getErrorMessage(error)
      );
    } finally {
      setSavingManual(false);
    }
  };

  const roleLabel = isAdmin ? 'Администратор' : 'Пользователь';
  const sessionLabel = !sessionInfo.hasToken
    ? 'Токен отсутствует'
    : sessionInfo.isExpired
      ? 'Сессия истекла'
      : 'Сессия активна';

  return (
    <div className="admin-settings">
      <div className="admin-header">
        <h1>Настройки доступа</h1>
      </div>

      <div className="admin-stats settings-stats">
        <div className="stat-item">
          <span className="stat-label">Пользователей</span>
          <span className="stat-value">{loadingUsers ? '...' : stats.total}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Администраторов</span>
          <span className="stat-value">{loadingUsers ? '...' : stats.admins}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Обычных ролей</span>
          <span className="stat-value">{loadingUsers ? '...' : stats.users}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Сессия</span>
          <span className="stat-value">{sessionLabel}</span>
        </div>
      </div>

      <div className="form-container">
        <div className="admin-form settings-hero">
          <div className="settings-hero-copy">
            <span className="settings-kicker">Access Control</span>
            <h2>Управление ролями пользователей</h2>
            <p>
              Здесь можно назначать или снимать права администратора. Изменения
              отправляются на сервер, поэтому после сохранения роль начнёт
              действовать во всей админ-панели.
            </p>
          </div>

          <div className="settings-hero-panel">
            <div className={`status ${sessionInfo.isExpired ? 'out-of-stock' : 'processing'}`}>
              {roleLabel}
            </div>
            <strong>{user?.email || 'Пользователь не определён'}</strong>
            <span>
              {sessionInfo.exp
                ? `Сессия до ${sessionInfo.exp.toLocaleString('ru-RU')}`
                : 'Время окончания сессии не передано'}
            </span>
          </div>
        </div>
      </div>

      <div className="settings-grid">
        <section className="settings-card">
          <h3>Назначить роль по email</h3>
          <p>
            Если список пользователей не пришёл с сервера, можно попробовать
            назначить роль вручную по email.
          </p>
          <form className="settings-manual-form" onSubmit={handleManualAssign}>
            <input
              type="email"
              className="settings-search"
              placeholder="email пользователя"
              value={manualEmail}
              onChange={(e) => setManualEmail(e.target.value)}
              required
            />
            <select
              className="settings-role-select"
              value={manualRole}
              onChange={(e) => setManualRole(e.target.value)}
            >
              <option value="admin">Администратор</option>
              <option value="user">Пользователь</option>
            </select>
            <button
              type="submit"
              className="btn-primary settings-save-btn"
              disabled={savingManual}
            >
              {savingManual ? 'Сохраняю...' : 'Назначить роль'}
            </button>
          </form>
        </section>

        <section className="settings-card settings-card-accent">
          <h3>Правила доступа</h3>
          <div className="settings-checklist">
            <div className="settings-check">
              <span className="status processing">01</span>
              <p>Выдавай права администратора только тем, кто реально работает с заказами и товарами.</p>
            </div>
            <div className="settings-check">
              <span className="status processing">02</span>
              <p>После смены роли пользователь получает доступ ко всей админ-панели после обновления сессии.</p>
            </div>
            <div className="settings-check">
              <span className="status pending">03</span>
              <p>Если доступ больше не нужен, верни роль `Пользователь`, чтобы закрыть административные разделы.</p>
            </div>
          </div>
        </section>
      </div>

      <div className="settings-card settings-card-wide">
        <div className="settings-toolbar">
          <div>
            <h3>Список пользователей</h3>
            <p className="settings-subtitle">
              Меняй роль на `Администратор` и сохраняй изменения точечно для
              каждого пользователя.
            </p>
          </div>

          <div className="settings-search-wrap">
            <input
              type="text"
              className="settings-search"
              placeholder="Поиск по email, имени или роли"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {notice && (
          <div className={`settings-notice ${notice.includes('Не удалось') ? 'error' : 'success'}`}>
            {notice}
          </div>
        )}

        {usersError && <div className="settings-notice error">{usersError}</div>}

        {loadingUsers ? (
          <div className="loading">Загрузка пользователей...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">Пользователи не найдены</div>
        ) : (
          <div className="admin-table settings-users-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Пользователь</th>
                  <th>Email</th>
                  <th>Текущая роль</th>
                  <th>Новая роль</th>
                  <th>Действие</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((item) => {
                  const draftRole = roleDrafts[item.id] || item.role;
                  const isDirty = draftRole !== item.role;
                  const isSaving = savingUserId === item.id;

                  return (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.full_name || 'Без имени'}</td>
                      <td>{item.email || '—'}</td>
                      <td>
                        <span className={`status ${item.role === 'admin' ? 'processing' : 'pending'}`}>
                          {item.role === 'admin' ? 'Администратор' : 'Пользователь'}
                        </span>
                      </td>
                      <td>
                        <select
                          className="settings-role-select"
                          value={draftRole}
                          onChange={(e) => handleRoleDraftChange(item.id, e.target.value)}
                          disabled={isSaving}
                        >
                          <option value="user">Пользователь</option>
                          <option value="admin">Администратор</option>
                        </select>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-primary settings-save-btn"
                          onClick={() => handleSaveRole(item)}
                          disabled={!isDirty || isSaving}
                        >
                          {isSaving ? 'Сохраняю...' : 'Сохранить'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
