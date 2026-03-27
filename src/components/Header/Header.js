import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useAuth } from '../../hooks/useAuth';
import './Header.css';

export const Header = ({ cartCount }) => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const profileName = user?.name || user?.full_name || user?.username || '';
  const displayName = profileName || user?.email || 'Пользователь';

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setShowProfile(false);
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [isAuthenticated]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  const profileModal =
    showProfile &&
    createPortal(
      <div
        className="profile-modal-overlay"
        onClick={() => setShowProfile(false)}
      >
        <div
          className="profile-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <h3>Профиль</h3>
          <div className="profile-row">
            <strong>Имя:</strong>
            <span>{profileName || '—'}</span>
          </div>
          <div className="profile-row">
            <strong>Email:</strong>
            <span>{user?.email || '—'}</span>
          </div>
          <div className="profile-row">
            <strong>Роль:</strong>
            <span>{isAdmin ? 'Администратор' : 'Пользователь'}</span>
          </div>
          <div className="profile-actions">
            <button
              className="btn-primary"
              onClick={() => {
                handleLogout();
                setShowProfile(false);
              }}
            >
              Выйти из аккаунта
            </button>
            <button
              className="btn-secondary"
              onClick={() => setShowProfile(false)}
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>,
      document.body
    );

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo" onClick={closeMenu}>
          <span className="logo-icon">NS</span>
          <span className="logo-text">NOCTA STORE</span>
        </Link>

        <button
          type="button"
          className={`header-burger ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`header-panel ${menuOpen ? 'open' : ''}`}>
          <nav className="header-nav">
            <Link to="/catalog" className="nav-link" onClick={closeMenu}>
              Каталог
            </Link>
          </nav>

          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Поиск товаров..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-btn">
              Поиск
            </button>
          </form>

          <div className="header-right">
            <Link to="/cart" className="cart-link" onClick={closeMenu}>
              <span className="cart-icon">Корзина</span>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>

            <div className="user-menu">
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" className="admin-btn" onClick={closeMenu}>
                      Админ-панель
                    </Link>
                  )}

                  <Link to="/orders" className="orders-link" onClick={closeMenu}>
                    Заказы
                  </Link>

                  <div className="user-info">
                    <div
                      className="user-profile clickable"
                      onClick={() => {
                        setShowProfile(true);
                        setMenuOpen(false);
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setShowProfile(true);
                          setMenuOpen(false);
                        }
                      }}
                    >
                      <span className="username">{displayName}</span>
                      <span className="user-role">
                        {isAdmin ? 'АДМИН' : 'ПОЛЬЗОВАТЕЛЬ'}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" className="auth-link" onClick={closeMenu}>
                    Вход
                  </Link>
                  <Link
                    to="/register"
                    className="auth-link register-link"
                    onClick={closeMenu}
                  >
                    Регистрация
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {profileModal}
    </header>
  );
};
