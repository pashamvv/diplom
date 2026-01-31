import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { useCart } from './hooks/useCart';

// Компоненты
import { Header } from './components/Header/Header';
import { RequireAuth } from './components/RequireAuth/RequireAuth';
import { AdminLayout } from './components/AdminLayout/AdminLayout';

// Страницы пользователя
import { Home } from './pages/Home/Home';
import { Catalog } from './pages/Catalog/Catalog';
import { CartPage } from './pages/Cart/CartPage';
import { Login } from './pages/Login/Login';
import { Register } from './pages/Register/Register';

// Админ-страницы
import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { AdminProducts } from './pages/AdminProducts/AdminProducts';
import { AdminCategories } from './pages/AdminCategories/AdminCategories';
import { AdminOrders } from './pages/AdminOrders/AdminOrders';
import { AdminDiscounts } from './pages/AdminDiscounts/AdminDiscounts';
import { AdminReports } from './pages/AdminReports/AdminReports';

// Стили
import './styles/global.css';
import './App.css';

// Компонент основного приложения (внутри Router)
const AppContent = () => {
  const { getTotalItems } = useCart();

  return (
    <>
      <Header cartCount={getTotalItems()} />
      <main className="app-main">
        <Routes>
          {/* Публичные маршруты */}
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<CartPage />} />

          {/* Защищённые маршруты для пользователей */}
          <Route
            path="/orders"
            element={
              <RequireAuth>
                <div className="page-placeholder">
                  <h1>Мои заказы</h1>
                  <p>Здесь будут отображаться ваши заказы</p>
                </div>
              </RequireAuth>
            }
          />
          <Route
            path="/product/:id"
            element={
              <div className="page-placeholder">
                <h1>Карточка товара</h1>
                <p>Подробная информация о товаре</p>
              </div>
            }
          />

          {/* Админ-маршруты (защищённые) */}
          <Route
            path="/admin/*"
            element={
              <RequireAuth requiredRole="ADMIN">
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
          </Route>

          {/* 404 */}
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

// Основное приложение
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
