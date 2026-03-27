import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

export const Home = () => {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-left">
            <div className="hero-badge">MAGIC × NOCTA</div>
            <h1>Добро пожаловать в Nocta Store</h1>
            <p>Лучший выбор компьютерной техники по честным ценам</p>

            <div className="hero-actions">
              <Link to="/catalog" className="hero-btn">
                Перейти в каталог
              </Link>
              <Link to="/catalog?sort=popular" className="hero-btn hero-btn-ghost">
                Популярное
              </Link>
            </div>

            <div className="hero-metrics">
              <div className="metric">
                <span className="metric-top">24/7</span>
                <span className="metric-title">24–48 ч</span>
                <span className="metric-sub">доставка</span>
              </div>
              <div className="metric">
                <span className="metric-top">Надёжно</span>
                <span className="metric-title">100%</span>
                <span className="metric-sub">защита</span>
              </div>
              <div className="metric">
                <span className="metric-top">Просто</span>
                <span className="metric-title">30 дней</span>
                <span className="metric-sub">возврат</span>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-card">
              <div className="hero-card-title">Быстрый старт</div>
              <div className="hero-card-grid">
                <Link to="/catalog?category=laptops" className="mini-tile">Ноутбуки</Link>
                <Link to="/catalog?category=monitors" className="mini-tile">Мониторы</Link>
                <Link to="/catalog?category=keyboards" className="mini-tile">Клавиатуры</Link>
                <Link to="/catalog?category=mice" className="mini-tile">Мыши</Link>
                <Link to="/catalog?category=headphones" className="mini-tile">Наушники</Link>
                <Link to="/catalog?category=accessories" className="mini-tile">Аксессуары</Link>
              </div>
              <Link to="/catalog" className="hero-card-cta">Открыть весь каталог</Link>
            </div>
          </div>
        </div>
      </section>
      <section className="categories-section">
        <div className="container">
          <div className="section-head">
            <h2>Популярные категории</h2>
            <Link to="/catalog" className="section-link">Все категории</Link>
          </div>

          <div className="chips-row">
            <Link to="/catalog?category=laptops" className="chip">Ноутбуки</Link>
            <Link to="/catalog?category=monitors" className="chip">Мониторы</Link>
            <Link to="/catalog?category=keyboards" className="chip">Клавиатуры</Link>
            <Link to="/catalog?category=mice" className="chip">Мыши</Link>
            <Link to="/catalog?category=headphones" className="chip">Наушники</Link>
            <Link to="/catalog?category=accessories" className="chip">Аксессуары</Link>
          </div>
        </div>
      </section>
      <section className="features-section">
        <div className="container">
          <div className="section-head">
            <h2>Почему выбирают нас</h2>
            <span className="section-sub">Сервис, скорость, безопасность</span>
          </div>

          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon feature-icon-delivery">
                <span className="feature-icon-mark">24ч</span>
              </span>
              <div>
                <h3>Быстрая доставка</h3>
                <p>Доставим товар в течение 24-48 часов</p>
              </div>
            </div>

            <div className="feature-item">
              <span className="feature-icon feature-icon-payment">
                <span className="feature-icon-mark">Оплата</span>
              </span>
              <div>
                <h3>Безопасные платежи</h3>
                <p>Все транзакции защищены и конфиденциальны</p>
              </div>
            </div>

            <div className="feature-item">
              <span className="feature-icon feature-icon-return">
                <span className="feature-icon-mark">30 дн</span>
              </span>
              <div>
                <h3>Гарантия возврата</h3>
                <p>30 дней для возврата любого товара</p>
              </div>
            </div>

            <div className="feature-item">
              <span className="feature-icon feature-icon-support">
                <span className="feature-icon-mark">24/7</span>
              </span>
              <div>
                <h3>Поддержка 24/7</h3>
                <p>Ответим на ваши вопросы в любое время</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
