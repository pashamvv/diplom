import React, { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import './AdminLayout.css';

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      <button
        type="button"
        className="admin-mobile-toggle"
        onClick={() => setSidebarOpen((prev) => !prev)}
        aria-label={sidebarOpen ? 'Закрыть меню админки' : 'Открыть меню админки'}
        aria-expanded={sidebarOpen}
      >
        ☰
      </button>

      {sidebarOpen && (
        <button
          type="button"
          className="admin-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-label="Закрыть меню"
        />
      )}

      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="admin-sidebar-top">
          <div className="admin-sidebar-brand">
            <span className="admin-sidebar-brand-icon">NA</span>
            <div>
              <strong>NOCTA ADMIN</strong>
              <span>Панель управления</span>
            </div>
          </div>
        </div>

        <nav className="admin-nav">
          <Link to="/" className="admin-nav-item admin-nav-store" onClick={() => setSidebarOpen(false)}>
            Вернуться в магазин
          </Link>

          <div className="admin-nav-section">
            <span className="admin-nav-label">Навигация</span>

            <NavLink to="/admin" end className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            Панель управления
            </NavLink>
            <NavLink to="/admin/products" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            Товары
            </NavLink>
            <NavLink to="/admin/categories" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            Категории
            </NavLink>
            <NavLink to="/admin/orders" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            Заказы
            </NavLink>
            <NavLink to="/admin/discounts" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            Скидки
            </NavLink>
            <NavLink to="/admin/reports" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            Отчёты
            </NavLink>
            <NavLink to="/admin/settings" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            Настройки
            </NavLink>
          </div>
        </nav>
      </aside>

      <main className="admin-main">
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
