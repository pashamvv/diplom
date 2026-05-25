import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usersAPI } from '../../api/endpoints';
import { useAuth } from '../../hooks/useAuth';
import './Profile.css';

const emptyAddressForm = {
  city: '',
  street: '',
  house: '',
  apartment: '',
  postal_code: '',
  is_default: false,
};

const getErrorMessage = (error, fallback = 'Не удалось выполнить действие') => {
  const detail = error?.response?.data?.detail;
  const message = error?.response?.data?.message;

  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map((item) => item?.msg || String(item)).join(', ');
  if (typeof message === 'string') return message;

  return fallback;
};

const normalizeAddress = (address) => ({
  id: Number(address?.id ?? 0),
  city: address?.city ?? '',
  street: address?.street ?? '',
  house: address?.house ?? '',
  apartment: address?.apartment ?? '',
  postal_code: address?.postal_code ?? address?.postalCode ?? '',
  is_default: Boolean(address?.is_default),
});

const addressTitle = (address) => {
  const parts = [address.city, address.street, address.house].filter(Boolean);
  return parts.length ? parts.join(', ') : 'Адрес без названия';
};

export const Profile = () => {
  const { user, refreshUser, setUserData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState(null);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [notice, setNotice] = useState({ type: '', text: '' });

  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
    email: '',
  });
  const [addressForm, setAddressForm] = useState(emptyAddressForm);
  const [addresses, setAddresses] = useState([]);

  const loadProfileData = useCallback(async () => {
    try {
      setLoading(true);
      setNotice({ type: '', text: '' });

      const [profileResponse, addressesResponse] = await Promise.all([
        usersAPI.getProfile(),
        usersAPI.getAddresses(),
      ]);

      const profileSource = profileResponse?.data || {};
      const addressesSource = addressesResponse?.data;
      const addressItems = Array.isArray(addressesSource)
        ? addressesSource
        : addressesSource?.items || addressesSource?.addresses || addressesSource?.data || [];

      setProfileForm({
        full_name:
          profileSource?.full_name ??
          profileSource?.name ??
          profileSource?.username ??
          '',
        phone: profileSource?.phone ?? '',
        email: profileSource?.email ?? '',
      });
      setAddresses(addressItems.map(normalizeAddress));
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
      setNotice({ type: 'error', text: getErrorMessage(error, 'Не удалось загрузить профиль') });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const sortedAddresses = useMemo(() => {
    return [...addresses].sort((a, b) => Number(b.is_default) - Number(a.is_default));
  }, [addresses]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const resetAddressForm = () => {
    setEditingAddressId(null);
    setAddressForm(emptyAddressForm);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (savingProfile) return;

    try {
      setSavingProfile(true);
      setNotice({ type: '', text: '' });

      const response = await usersAPI.updateProfile({
        full_name: profileForm.full_name.trim(),
        phone: profileForm.phone.trim(),
      });

      if (response?.data) {
        setUserData(response.data);
      } else {
        await refreshUser();
      }

      setNotice({ type: 'success', text: 'Профиль обновлён' });
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
      setNotice({ type: 'error', text: getErrorMessage(error, 'Не удалось обновить профиль') });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddressEdit = (address) => {
    setEditingAddressId(address.id);
    setAddressForm({
      city: address.city,
      street: address.street,
      house: address.house,
      apartment: address.apartment,
      postal_code: address.postal_code,
      is_default: address.is_default,
    });
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (savingAddress) return;

    const payload = {
      city: addressForm.city.trim(),
      street: addressForm.street.trim(),
      house: addressForm.house.trim(),
      apartment: addressForm.apartment.trim(),
      postal_code: addressForm.postal_code.trim(),
      is_default: Boolean(addressForm.is_default),
    };

    try {
      setSavingAddress(true);
      setNotice({ type: '', text: '' });

      if (editingAddressId) {
        await usersAPI.updateAddress(editingAddressId, payload);
      } else {
        await usersAPI.createAddress(payload);
      }

      await loadProfileData();
      resetAddressForm();
      setNotice({
        type: 'success',
        text: editingAddressId ? 'Адрес обновлён' : 'Адрес добавлен',
      });
    } catch (error) {
      console.error('Ошибка сохранения адреса:', error);
      setNotice({ type: 'error', text: getErrorMessage(error, 'Не удалось сохранить адрес') });
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Удалить этот адрес?')) return;

    try {
      setDeletingAddressId(addressId);
      setNotice({ type: '', text: '' });
      await usersAPI.deleteAddress(addressId);
      await loadProfileData();
      if (editingAddressId === addressId) {
        resetAddressForm();
      }
      setNotice({ type: 'success', text: 'Адрес удалён' });
    } catch (error) {
      console.error('Ошибка удаления адреса:', error);
      setNotice({ type: 'error', text: getErrorMessage(error, 'Не удалось удалить адрес') });
    } finally {
      setDeletingAddressId(null);
    }
  };

  if (loading) {
    return <div className="profile-loading">Загрузка профиля...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-shell">
        <div className="profile-hero">
          <div>
            <span className="profile-kicker">NOCTA ACCOUNT</span>
            <h1>Профиль пользователя</h1>
            <p>Редактируй личные данные и управляй адресами доставки в одном месте.</p>
          </div>

          <div className="profile-hero-card">
            <span className="profile-hero-label">Текущая сессия</span>
            <strong>{profileForm.full_name || user?.email || 'Пользователь'}</strong>
            <span>{user?.email || profileForm.email || '—'}</span>
          </div>
        </div>

        {notice.text && (
          <div className={`profile-notice ${notice.type === 'error' ? 'error' : 'success'}`}>
            {notice.text}
          </div>
        )}

        <div className="profile-grid">
          <section className="profile-card">
            <div className="profile-card-head">
              <h2>Личные данные</h2>
              <p>Имя и телефон используются для оформления заказов и связи.</p>
            </div>

            <form className="profile-form" onSubmit={handleProfileSubmit}>
              <div className="profile-field">
                <label htmlFor="full_name">Имя</label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  value={profileForm.full_name}
                  onChange={handleProfileChange}
                  placeholder="Ваше имя"
                />
              </div>

              <div className="profile-field">
                <label htmlFor="phone">Телефон</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={profileForm.phone}
                  onChange={handleProfileChange}
                  placeholder="+7 (999) 123-45-67"
                />
              </div>

              <div className="profile-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={profileForm.email}
                  readOnly
                  disabled
                />
              </div>

              <div className="profile-actions">
                <button type="submit" className="profile-primary-btn" disabled={savingProfile}>
                  {savingProfile ? 'Сохраняю...' : 'Сохранить профиль'}
                </button>
              </div>
            </form>
          </section>

          <section className="profile-card">
            <div className="profile-card-head">
              <h2>{editingAddressId ? 'Редактирование адреса' : 'Новый адрес'}</h2>
              <p>Можно сохранить адрес по умолчанию для более быстрого оформления.</p>
            </div>

            <form className="profile-form" onSubmit={handleAddressSubmit}>
              <div className="profile-form-grid">
                <div className="profile-field">
                  <label htmlFor="city">Город</label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={addressForm.city}
                    onChange={handleAddressChange}
                    placeholder="Москва"
                    required
                  />
                </div>

                <div className="profile-field">
                  <label htmlFor="street">Улица</label>
                  <input
                    id="street"
                    name="street"
                    type="text"
                    value={addressForm.street}
                    onChange={handleAddressChange}
                    placeholder="Ленина"
                    required
                  />
                </div>

                <div className="profile-field">
                  <label htmlFor="house">Дом</label>
                  <input
                    id="house"
                    name="house"
                    type="text"
                    value={addressForm.house}
                    onChange={handleAddressChange}
                    placeholder="10"
                    required
                  />
                </div>

                <div className="profile-field">
                  <label htmlFor="apartment">Квартира</label>
                  <input
                    id="apartment"
                    name="apartment"
                    type="text"
                    value={addressForm.apartment}
                    onChange={handleAddressChange}
                    placeholder="25"
                  />
                </div>

                <div className="profile-field">
                  <label htmlFor="postal_code">Индекс</label>
                  <input
                    id="postal_code"
                    name="postal_code"
                    type="text"
                    value={addressForm.postal_code}
                    onChange={handleAddressChange}
                    placeholder="101000"
                  />
                </div>
              </div>

              <label className="profile-checkbox">
                <input
                  name="is_default"
                  type="checkbox"
                  checked={addressForm.is_default}
                  onChange={handleAddressChange}
                />
                <span>Сделать адресом по умолчанию</span>
              </label>

              <div className="profile-actions">
                <button type="submit" className="profile-primary-btn" disabled={savingAddress}>
                  {savingAddress
                    ? 'Сохраняю...'
                    : editingAddressId
                      ? 'Обновить адрес'
                      : 'Добавить адрес'}
                </button>
                {editingAddressId && (
                  <button
                    type="button"
                    className="profile-secondary-btn"
                    onClick={resetAddressForm}
                    disabled={savingAddress}
                  >
                    Отмена
                  </button>
                )}
              </div>
            </form>
          </section>
        </div>

        <section className="profile-card profile-card-wide">
          <div className="profile-card-head">
            <h2>Мои адреса</h2>
            <p>Сохраняй несколько адресов доставки и быстро переключайся между ними.</p>
          </div>

          {sortedAddresses.length === 0 ? (
            <div className="profile-empty">Пока нет сохранённых адресов</div>
          ) : (
            <div className="profile-address-list">
              {sortedAddresses.map((address) => (
                <article key={address.id} className="profile-address-card">
                  <div className="profile-address-head">
                    <div>
                      <h3>{addressTitle(address)}</h3>
                      <p>
                        {[address.apartment && `кв. ${address.apartment}`, address.postal_code]
                          .filter(Boolean)
                          .join(' • ') || 'Без дополнительных данных'}
                      </p>
                    </div>

                    {address.is_default && <span className="profile-default-badge">По умолчанию</span>}
                  </div>

                  <div className="profile-address-actions">
                    <button
                      type="button"
                      className="profile-secondary-btn"
                      onClick={() => handleAddressEdit(address)}
                    >
                      Редактировать
                    </button>
                    <button
                      type="button"
                      className="profile-danger-btn"
                      onClick={() => handleDeleteAddress(address.id)}
                      disabled={deletingAddressId === address.id}
                    >
                      {deletingAddressId === address.id ? 'Удаляю...' : 'Удалить'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
