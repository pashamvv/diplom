import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useAuth } from '../../hooks/useAuth';
import './Header.css';

const HeaderActionLink = ({
  to,
  label,
  className = '',
  onClick,
  children,
  active = false,
  index = 0,
}) => (
  <motion.div
    className="header-action-wrap"
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.28, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ y: -3, scale: 1.04 }}
    whileTap={{ scale: 0.97 }}
  >
    <Link
      to={to}
      className={`header-action-link ${className} ${active ? 'is-active' : ''}`.trim()}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <span className="header-action-icon" aria-hidden="true">
        {children}
      </span>
      <span className="sr-only">{label}</span>
    </Link>
  </motion.div>
);

export const Header = ({ cartCount }) => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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

  const profileModal = createPortal(
    <AnimatePresence>
      {showProfile && (
        <motion.div
          className="profile-modal-overlay"
          onClick={() => setShowProfile(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.div
            className="profile-modal"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              className="profile-modal-close"
              onClick={() => setShowProfile(false)}
              aria-label="Закрыть"
            >
              ×
            </button>
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
                className="btn-secondary"
                onClick={() => {
                  setShowProfile(false);
                  navigate('/profile');
                }}
              >
                Открыть профиль
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  handleLogout();
                  setShowProfile(false);
                }}
              >
                Выйти из аккаунта
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo" onClick={closeMenu}>
          <span className="logo-icon" aria-hidden="true">
            <svg className="logo-icon-svg" viewBox="0 0 40 40">
              <rect x="8" y="9" width="24" height="16" rx="4" />
              <path d="M12.5 28h15" />
              <path d="M16 25v3" />
              <path d="M24 25v3" />
              <path d="M14 14h12" />
              <path d="M14 18h8" />
            </svg>
          </span>
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
            <Link
              to="/cart"
              className="cart-link"
              onClick={closeMenu}
              aria-label="Корзина"
            >
              <svg
                className="cart-icon-image"
                viewBox="0 0 28 28"
                aria-hidden="true"
              >
                <path d="M9.625 22.75C8.6585 22.75 7.875 23.5335 7.875 24.5C7.875 25.4665 8.6585 26.25 9.625 26.25C10.5915 26.25 11.375 25.4665 11.375 24.5C11.375 23.5335 10.5915 22.75 9.625 22.75Z" />
                <path d="M21.875 22.75C20.9085 22.75 20.125 23.5335 20.125 24.5C20.125 25.4665 20.9085 26.25 21.875 26.25C22.8415 26.25 23.625 25.4665 23.625 24.5C23.625 23.5335 22.8415 22.75 21.875 22.75Z" />
                <path d="M4.51182 4.375H6.56334C7.04822 4.375 7.47307 4.69975 7.6003 5.16765L7.9796 6.5625H23.1795C24.4408 6.5625 25.3402 7.78553 24.9759 8.99307L23.0721 15.3056C22.7935 16.2292 21.9422 16.8625 20.9774 16.8625H10.1677C9.18894 16.8625 8.3294 16.211 8.0634 15.2689L5.30927 5.51563H4.51182C3.90701 5.51563 3.41699 5.02561 3.41699 4.4208C3.41699 3.81599 3.90701 3.32598 4.51182 3.32598V4.375Z" />
                <path d="M9.13281 19.25C8.528 19.25 8.03798 19.74 8.03798 20.3448C8.03798 20.9496 8.528 21.4396 9.13281 21.4396H22.2578C22.8626 21.4396 23.3526 20.9496 23.3526 20.3448C23.3526 19.74 22.8626 19.25 22.2578 19.25H9.13281Z" />
              </svg>
              <span className="sr-only">Корзина</span>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>

            <div className="user-menu">
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <HeaderActionLink
                      to="/admin"
                      label="Админ-панель"
                      className="admin-btn"
                      onClick={closeMenu}
                      active={location.pathname.startsWith('/admin')}
                      index={0}
                    >
                      <svg viewBox="0 0 24 24">
                        <path d="M12 3l7 4v5c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V7l7-4Z" />
                        <path d="M9.5 12.2 11.2 14l3.6-4" />
                      </svg>
                    </HeaderActionLink>
                  )}

                  <HeaderActionLink
                    to="/orders"
                    label="Заказы"
                    className="orders-link"
                    onClick={closeMenu}
                    active={location.pathname === '/orders'}
                    index={1}
                  >
                    <svg viewBox="0 0 24 24">
                      <path d="M7 4.5h10" />
                      <path d="M7 8.5h10" />
                      <path d="M7 12.5h6" />
                      <path d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
                    </svg>
                  </HeaderActionLink>

                  <HeaderActionLink
                    to="/profile"
                    label="Профиль"
                    className="orders-link"
                    onClick={closeMenu}
                    active={location.pathname === '/profile'}
                    index={2}
                  >
                    <svg viewBox="0 0 24 24">
                      <circle cx="12" cy="8" r="3.2" />
                      <path d="M5 19c1.7-3 4.1-4.5 7-4.5s5.3 1.5 7 4.5" />
                    </svg>
                  </HeaderActionLink>

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
