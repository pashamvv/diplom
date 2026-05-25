import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { CartProvider, useCart } from './hooks/useCart';

import { Header } from './components/Header/Header';
import { RequireAuth } from './components/RequireAuth/RequireAuth';
import { AdminLayout } from './components/AdminLayout/AdminLayout';

import { Home } from './pages/Home/Home';
import { Catalog } from './pages/Catalog/Catalog';
import { CartPage } from './pages/Cart/CartPage';
import { Login } from './pages/Login/Login';
import { Register } from './pages/Register/Register';
import { Product } from './pages/Product/Product';
import { OrdersPage } from './pages/Orders/OrdersPage';
import { Profile } from './pages/Profile/Profile';

import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { AdminProducts } from './pages/AdminProducts/AdminProducts';
import { AdminCategories } from './pages/AdminCategories/AdminCategories';
import { AdminOrders } from './pages/AdminOrders/AdminOrders';
import { AdminDiscounts } from './pages/AdminDiscounts/AdminDiscounts';
import { AdminReports } from './pages/AdminReports/AdminReports';
import { AdminSettings } from './pages/AdminSettings/AdminSettings';

import './styles/global.css';
import './App.css';

const AppContent = () => {
  const { getTotalItems } = useCart();
  const { isAdmin } = useAuth();
  const location = useLocation();
  const didMountRef = useRef(false);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('nocta-theme');

    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });
  const [themeTransitioning, setThemeTransitioning] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nocta-theme', theme);
  }, [theme]);

  useEffect(() => {
    const pathname = location.pathname;
    let pageTitle = 'NOCTA STORE';

    if (pathname === '/') pageTitle = 'NOCTA STORE';
    else if (pathname === '/catalog') pageTitle = 'Каталог | NOCTA STORE';
    else if (pathname === '/login') pageTitle = 'Вход | NOCTA STORE';
    else if (pathname === '/register') pageTitle = 'Регистрация | NOCTA STORE';
    else if (pathname === '/cart') pageTitle = 'Корзина | NOCTA STORE';
    else if (pathname === '/orders') pageTitle = 'Мои заказы | NOCTA STORE';
    else if (pathname === '/profile') pageTitle = 'Профиль | NOCTA STORE';
    else if (pathname.startsWith('/product/')) pageTitle = 'Товар | NOCTA STORE';
    else if (pathname === '/admin') pageTitle = 'Админ-панель | NOCTA STORE';
    else if (pathname === '/admin/products') pageTitle = 'Товары | NOCTA STORE';
    else if (pathname === '/admin/categories') pageTitle = 'Категории | NOCTA STORE';
    else if (pathname === '/admin/orders') pageTitle = 'Заказы | NOCTA STORE';
    else if (pathname === '/admin/discounts') pageTitle = 'Скидки | NOCTA STORE';
    else if (pathname === '/admin/reports') pageTitle = 'Отчёты | NOCTA STORE';
    else if (pathname === '/admin/settings') pageTitle = 'Настройки | NOCTA STORE';
    else pageTitle = 'NOCTA STORE';

    document.title = pageTitle;
  }, [location.pathname]);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return undefined;
    }

    setThemeTransitioning(true);
    const timerId = window.setTimeout(() => {
      setThemeTransitioning(false);
    }, 760);

    return () => window.clearTimeout(timerId);
  }, [theme]);

  const showHeader = !isAdmin || !location.pathname.startsWith('/admin');
  const routeTransitionKey = location.pathname;

  return (
    <>
      {showHeader && <Header cartCount={getTotalItems()} />}
      <button
        type="button"
        className={`theme-fab ${theme === 'dark' ? 'dark' : 'light'}`}
        onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        aria-label={
          theme === 'dark' ? 'Включить светлую тему' : 'Включить темную тему'
        }
      >
        <span className="theme-fab-icon" aria-hidden="true">
          {theme === 'dark' ? (
            <svg className="theme-fab-icon-svg" viewBox="0 0 24 24">
              <path d="M12 3.5v2.2" />
              <path d="M12 18.3v2.2" />
              <path d="M5.9 5.9 7.4 7.4" />
              <path d="m16.6 16.6 1.5 1.5" />
              <path d="M3.5 12h2.2" />
              <path d="M18.3 12h2.2" />
              <path d="m5.9 18.1 1.5-1.5" />
              <path d="m16.6 7.4 1.5-1.5" />
              <circle cx="12" cy="12" r="4.2" />
            </svg>
          ) : (
            <svg className="theme-fab-icon-svg" viewBox="0 0 24 24">
              <path d="M15.5 3.8a8 8 0 1 0 4.7 14.5 8.6 8.6 0 0 1-2.6.4c-4.7 0-8.5-3.8-8.5-8.5 0-2.5 1-4.8 2.8-6.4a8 8 0 0 0 3.6 0Z" />
            </svg>
          )}
        </span>
        <span className="theme-fab-label">
          {theme === 'dark' ? 'Light' : 'Dark'}
        </span>
      </button>
      <main className={`app-main ${themeTransitioning ? 'theme-transitioning' : ''}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={routeTransitionKey}
            className="route-shell"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{
              duration: 0.48,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/product/:id" element={<Product />} />

              <Route
                path="/profile"
                element={
                  <RequireAuth>
                    <Profile />
                  </RequireAuth>
                }
              />

              <Route
                path="/orders"
                element={
                  <RequireAuth>
                    <OrdersPage />
                  </RequireAuth>
                }
              />

              <Route
                path="/admin"
                element={
                  <RequireAuth requiredRole="admin">
                    <AdminLayout />
                  </RequireAuth>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="discounts" element={<AdminDiscounts />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              <Route
                path="*"
                element={
                  <div className="page-placeholder">
                    <h1>404 - Страница не найдена</h1>
                    <p>Возможно, вы ищете что-то другое?</p>
                  </div>
                }
              />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
