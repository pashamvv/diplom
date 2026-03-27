import React, { useEffect, useState } from 'react';
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
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('nocta-theme');

    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nocta-theme', theme);
  }, [theme]);

  const showHeader = !isAdmin || !location.pathname.startsWith('/admin');

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
        <span className="theme-fab-icon">{theme === 'dark' ? 'С' : 'Т'}</span>
        <span className="theme-fab-label">
          {theme === 'dark' ? 'Light' : 'Dark'}
        </span>
      </button>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/product/:id" element={<Product />} />

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
