import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Login.css';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      const dest = location.state?.from?.pathname || '/';
      navigate(dest, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Ошибка входа. Проверьте email и пароль.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-badge">NOCTA ID</div>

          <div className="auth-head">
            <div>
              <span className="auth-kicker">Безопасный вход</span>
              <h1>Вход</h1>
              <p className="auth-subtitle">Введите учётные данные, чтобы продолжить покупки</p>
            </div>
            <span className="auth-chip">NOCTA × MAGIC</span>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Пароль</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Загрузка...' : 'Войти'}
            </button>
          </form>

          <div className="auth-note">
            Вход защищён, а профиль и заказы синхронизируются автоматически.
          </div>

          <p className="auth-switch">
            Нет аккаунта?{' '}
            <Link to="/register" className="auth-link">
              Создайте его
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
