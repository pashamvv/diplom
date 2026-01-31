import React, { useState, useEffect } from 'react';
import { ordersAPI, productsAPI, reportsAPI } from '../../api/endpoints';
import '../Admin.css';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    salesData: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [orders, products, sales] = await Promise.all([
        ordersAPI.getAll(),
        productsAPI.getAll(),
        reportsAPI.getSales(),
      ]);
      setStats({
        totalOrders: orders.data.length,
        totalProducts: products.data.length,
        salesData: sales.data,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Загрузка статистики...</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1>Панель управления</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <h3>Заказы</h3>
          <p className="stat-value">{stats.totalOrders}</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <h3>Товары</h3>
          <p className="stat-value">{stats.totalProducts}</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <h3>Всего продаж</h3>
          <p className="stat-value">
            {stats.salesData.reduce((sum, s) => sum + (s.total || 0), 0).toFixed(0)}₽
          </p>
        </div>
      </div>

      <div className="recent-orders">
        <h2>Последние заказы</h2>
        <p>Последнюю информацию можно найти на странице заказов</p>
      </div>
    </div>
  );
};
