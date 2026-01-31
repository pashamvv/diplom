import React, { useState, useEffect } from 'react';
import { reportsAPI } from '../../api/endpoints';
import '../Admin.css';

export const AdminReports = () => {
  const [topProducts, setTopProducts] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const [topProds, userSt] = await Promise.all([
        reportsAPI.getTopProducts(),
        reportsAPI.getUserStats(),
      ]);
      setTopProducts(topProds.data || []);
      setUserStats(userSt.data);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Загрузка отчётов...</div>;
  }

  return (
    <div className="admin-reports">
      <h1>Отчёты</h1>

      {/* Статистика пользователей */}
      <div className="reports-section">
        <h2>Статистика пользователей</h2>
        {userStats && (
          <div className="stats-grid">
            <div className="stat-card">
              <p>Всего пользователей</p>
              <strong>{userStats.total_users || 0}</strong>
            </div>
            <div className="stat-card">
              <p>Активных пользователей</p>
              <strong>{userStats.active_users || 0}</strong>
            </div>
            <div className="stat-card">
              <p>Новых за месяц</p>
              <strong>{userStats.new_users_month || 0}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Топ товаров */}
      <div className="reports-section">
        <h2>Топ 10 товаров</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Продано</th>
              <th>Доход</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.map((product, idx) => (
              <tr key={idx}>
                <td>{product.name}</td>
                <td>{product.quantity_sold || 0}</td>
                <td>{product.total_revenue?.toFixed(0) || 0}₽</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
