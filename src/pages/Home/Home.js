import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

export const Home = () => {
  return (
    <div className="home-page">
      {/* Hero секция */}
      <section className="hero">
        <div className="hero-content">
          <h1>Добро пожаловать в TechStore</h1>
          <p>Лучший выбор компьютерной техники по честным ценам</p>
          <Link to="/catalog" className="hero-btn">
            Перейти в каталог
          </Link>
        </div>
      </section>

      {/* Категории */}
      <section className="categories-section">
        <div className="container">
          <h2>Популярные категории</h2>
          <div className="categories-grid">
            <Link to="/catalog?category=laptops" className="category-card">
              <span className="category-icon">💻</span>
              <span className="category-name">Ноутбуки</span>
            </Link>
            <Link to="/catalog?category=monitors" className="category-card">
              <span className="category-icon">🖥️</span>
              <span className="category-name">Мониторы</span>
            </Link>
            <Link to="/catalog?category=keyboards" className="category-card">
              <span className="category-icon">⌨️</span>
              <span className="category-name">Клавиатуры</span>
            </Link>
            <Link to="/catalog?category=mice" className="category-card">
              <span className="category-icon">🖱️</span>
              <span className="category-name">Мыши</span>
            </Link>
            <Link to="/catalog?category=headphones" className="category-card">
              <span className="category-icon">🎧</span>
              <span className="category-name">Наушники</span>
            </Link>
            <Link to="/catalog?category=accessories" className="category-card">
              <span className="category-icon">🔌</span>
              <span className="category-name">Аксессуары</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Преимущества */}
      <section className="features-section">
        <div className="container">
          <h2>Почему выбирают нас</h2>
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon">🚚</span>
              <h3>Быстрая доставка</h3>
              <p>Доставим товар в течение 24-48 часов</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💳</span>
              <h3>Безопасные платежи</h3>
              <p>Все транзакции защищены и конфиденциальны</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔄</span>
              <h3>Гарантия возврата</h3>
              <p>30 дней для возврата любого товара</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💬</span>
              <h3>Поддержка 24/7</h3>
              <p>Ответим на ваши вопросы в любое время</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
