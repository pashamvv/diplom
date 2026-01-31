import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import './AdminLayout.css';

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="admin-layout">
      {/* Боковая панель навигации */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          ☰
        </button>

        <nav className="admin-nav">
          <Link to="/admin" className="admin-nav-item">
            📊 Панель управления
          </Link>
          <Link to="/admin/products" className="admin-nav-item">
            📦 Товары
          </Link>
          <Link to="/admin/categories" className="admin-nav-item">
            🏷️ Категории
          </Link>
          <Link to="/admin/orders" className="admin-nav-item">
            📋 Заказы
          </Link>
          <Link to="/admin/discounts" className="admin-nav-item">
            💰 Скидки
          </Link>
          <Link to="/admin/reports" className="admin-nav-item">
            📈 Отчёты
          </Link>
        </nav>
      </aside>

      {/* Основной контент */}
      <main className="admin-main">
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
