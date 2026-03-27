import React, { useState, useEffect, useMemo } from 'react';
import { ordersAPI } from '../../api/endpoints';
import '../Admin.css';

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingOrder, setEditingOrder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await ordersAPI.getAll();
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    if (filterStatus) {
      filtered = filtered.filter((o) => o.status === filterStatus);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter((o) => {
        const idStr = o?.id != null ? String(o.id) : '';
        const userIdStr = o?.user_id != null ? String(o.user_id) : '';
        const statusStr = (o?.status || '').toLowerCase();

        return (
          idStr.includes(q) ||
          userIdStr.includes(q) ||
          statusStr.includes(q)
        );
      });
    }

    return filtered;
  }, [orders, filterStatus, searchQuery]);
  const handleStatusChange = async (id, newStatus) => {
    try {
      await ordersAPI.updateStatus(id, newStatus);
      await loadOrders();
      setEditingOrder(null);
      alert('Статус заказа обновлён');
    } catch (error) {
      alert('Ошибка при обновлении статуса');
      console.error(error);
    }
  };

  const openStatusModal = (order) => {
    setEditingOrder(order);
    setSelectedStatus(order.status || 'pending');
  };

  const closeStatusModal = () => {
    setEditingOrder(null);
    setSelectedStatus('');
  };

  const getStatusColor = (status) => {
    const statusMap = {
      pending: 'pending',
      processing: 'processing',
      shipped: 'shipped',
      delivered: 'delivered',
      cancelled: 'cancelled',
    };
    return statusMap[status] || status;
  };

  const statusLabels = {
    pending: 'В ожидании',
    processing: 'Обработка',
    shipped: 'Отправлен',
    delivered: 'Доставлен',
    cancelled: 'Отменён',
  };
  const totalSum = useMemo(() => {
    return orders
      .reduce((sum, o) => sum + Number(o?.total_price || 0), 0)
      .toFixed(0);
  }, [orders]);

  if (loading) {
    return <div className="loading">Загрузка заказов...</div>;
  }

  return (
    <div className="admin-orders">
      <div className="admin-header">
        <h1>Управление заказами</h1>
      </div>

      {editingOrder && (
        <div className="admin-modal-overlay" onClick={closeStatusModal}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <span className="admin-modal-caption">Заказы</span>
                <h2>Обновление статуса</h2>
                <p>Смена статуса заказа теперь открывается в отдельной аккуратной модалке.</p>
              </div>

              <button type="button" className="admin-modal-close" onClick={closeStatusModal}>
                Закрыть
              </button>
            </div>

            <div className="admin-form-card">
              <p className="admin-form-section-title">Данные заказа</p>

              <div className="admin-order-summary">
                <div className="admin-order-summary-item">
                  <span>Заказ</span>
                  <strong>#{editingOrder.id}</strong>
                </div>
                <div className="admin-order-summary-item">
                  <span>Пользователь</span>
                  <strong>{editingOrder.user_id != null ? editingOrder.user_id : '—'}</strong>
                </div>
                <div className="admin-order-summary-item">
                  <span>Сумма</span>
                  <strong>
                    {editingOrder.total_price != null
                      ? `${Number(editingOrder.total_price).toFixed(0)}₽`
                      : '—'}
                  </strong>
                </div>
                <div className="admin-order-summary-item">
                  <span>Дата</span>
                  <strong>
                    {editingOrder.created_at
                      ? new Date(editingOrder.created_at).toLocaleDateString('ru-RU')
                      : '—'}
                  </strong>
                </div>
              </div>
            </div>

            <div className="admin-form-card">
              <p className="admin-form-section-title">Новый статус</p>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="filter-select"
              >
                <option value="pending">В ожидании</option>
                <option value="processing">Обработка</option>
                <option value="shipped">Отправлен</option>
                <option value="delivered">Доставлен</option>
                <option value="cancelled">Отменён</option>
              </select>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="btn-primary"
                onClick={() => handleStatusChange(editingOrder.id, selectedStatus)}
              >
                Сохранить статус
              </button>
              <button type="button" className="btn-secondary" onClick={closeStatusModal}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="admin-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Поиск по ID заказа / ID пользователя / статусу..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-box">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">Все статусы</option>
            <option value="pending">В ожидании</option>
            <option value="processing">Обработка</option>
            <option value="shipped">Отправлен</option>
            <option value="delivered">Доставлен</option>
            <option value="cancelled">Отменён</option>
          </select>
        </div>
      </div>
      <div className="admin-stats">
        <div className="stat-item">
          <span className="stat-label">Всего заказов:</span>
          <span className="stat-value">{orders.length}</span>
        </div>

        <div className="stat-item">
          <span className="stat-label">Отображено:</span>
          <span className="stat-value">{filteredOrders.length}</span>
        </div>

        <div className="stat-item">
          <span className="stat-label">Сумма всех заказов:</span>
          <span className="stat-value">{totalSum}₽</span>
        </div>
      </div>
      <div className="admin-table">
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <p>Заказов не найдено</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>ID пользователя</th>
                <th>Сумма</th>
                <th>Статус</th>
                <th>Дата</th>
                <th>Действия</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="order-id">#{order.id}</td>

                  <td className="order-user">
                    {order.user_id != null ? order.user_id : '—'}
                  </td>

                  <td className="order-total">
                    {order.total_price != null
                      ? `${Number(order.total_price).toFixed(0)}₽`
                      : '—'}
                  </td>

                  <td>
                    <span className={`status ${getStatusColor(order.status)}`}>
                      {statusLabels[order.status] || order.status || '—'}
                    </span>
                  </td>

                  <td>
                    {order.created_at
                      ? new Date(order.created_at).toLocaleDateString('ru-RU')
                      : '—'}
                  </td>

                  <td>
                    <button
                      type="button"
                      className="btn-sm btn-edit"
                      onClick={() => openStatusModal(order)}
                    >
                      Изменить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
