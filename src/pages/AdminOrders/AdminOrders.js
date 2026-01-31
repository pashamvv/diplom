import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../../api/endpoints';
import '../Admin.css';

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await ordersAPI.updateStatus(id, newStatus);
      loadOrders();
      alert('Статус заказа обновлён');
    } catch (error) {
      alert('Ошибка при обновлении статуса');
      console.error(error);
    }
  };

  if (loading) {
    return <div className="loading">Загрузка заказов...</div>;
  }

  return (
    <div className="admin-orders">
      <h1>Управление заказами</h1>

      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Клиент</th>
              <th>Сумма</th>
              <th>Статус</th>
              <th>Дата</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.user?.name || 'Гость'}</td>
                <td>{order.total?.toFixed(0)}₽ || '—'}</td>
                <td>
                  <span className={`status ${order.status}`}>
                    {order.status}
                  </span>
                </td>
                <td>{new Date(order.created_at).toLocaleDateString('ru-RU')}</td>
                <td>
                  <select
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    defaultValue={order.status}
                  >
                    <option value="pending">В ожидании</option>
                    <option value="processing">Обработка</option>
                    <option value="shipped">Отправлен</option>
                    <option value="delivered">Доставлен</option>
                    <option value="cancelled">Отменён</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
