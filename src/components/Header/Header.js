import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Header.css';

export const Header = ({ cartCount }) => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Логотип */}
        <Link to="/" className="logo">
          <span className="logo-icon">💻</span>
          <span className="logo-text">TechStore</span>
        </Link>

        {/* Навигация */}
        <nav className="header-nav">
          <Link to="/catalog" className="nav-link">
            Каталог
          </Link>
        </nav>

        {/* Поиск */}
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Поиск товаров..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-btn">
            🔍
          </button>
        </form>

        {/* Правая часть хедера */}
        <div className="header-right">
          {/* Корзина */}
          <Link to="/cart" className="cart-link">
            <span className="cart-icon">🛒</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {/* Кнопки пользователя */}
          <div className="user-menu">
            {isAuthenticated ? (
              <>
                {/* Админ-панель (только для ADMIN) */}
                {isAdmin && (
                  <Link to="/admin" className="admin-btn">
                    Админ-панель
                  </Link>
                )}

                {/* Мои заказы */}
                <Link to="/orders" className="orders-link">
                  Заказы
                </Link>

                {/* Имя пользователя и выход */}
                <div className="user-info">
                  <span className="username">{user?.name || user?.email}</span>
                  <button
                    onClick={handleLogout}
                    className="logout-btn"
                  >
                    Выход
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="auth-link">
                  Вход
                </Link>
                <Link to="/register" className="auth-link register-link">
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
