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
                <span className="metric-icon metric-icon-delivery" aria-hidden="true">
                  <svg viewBox="0 0 48 48">
                    <rect x="6" y="16" width="22" height="14" rx="4" />
                    <path d="M28 20h7l5 5v5h-12z" />
                    <circle cx="17" cy="33" r="3.5" />
                    <circle cx="35" cy="33" r="3.5" />
                    <path d="M12 13c1.4-3 4.1-5.2 8.2-5.7" />
                    <path d="M15.5 9.5 20.8 7l1.5 5.7" />
                  </svg>
                </span>
                <span className="metric-top">24/7</span>
                <span className="metric-title">24–48 ч</span>
                <span className="metric-sub">доставка</span>
              </div>
              <div className="metric">
                <span className="metric-icon metric-icon-protect" aria-hidden="true">
                  <svg viewBox="0 0 48 48">
                    <path d="M24 7l12 4.5V22c0 8-4.9 13.8-12 17-7.1-3.2-12-9-12-17V11.5z" />
                    <path d="m18.5 24 4.2 4.2L30 19.8" />
                  </svg>
                </span>
                <span className="metric-top">Надёжно</span>
                <span className="metric-title">100%</span>
                <span className="metric-sub">защита</span>
              </div>
              <div className="metric">
                <span className="metric-icon metric-icon-return" aria-hidden="true">
                  <svg viewBox="0 0 48 48">
                    <path d="M15 17H8v-7" />
                    <path d="M8.5 17C11.4 12 16.8 9 23 9c8.8 0 16 6.6 16 15s-7.2 15-16 15c-6.7 0-12.5-3.6-15-9" />
                    <path d="M24 16v8l6 3.5" />
                  </svg>
                </span>
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
                <span className="feature-icon-mark" aria-hidden="true">
                  <svg className="feature-icon-svg" viewBox="0 0 32 32">
                    <rect x="4.5" y="11" width="13" height="8.5" rx="2.5" />
                    <path d="M17.5 13h4.5l3 3v3.5h-7.5z" />
                    <circle cx="12" cy="22" r="2.2" />
                    <circle cx="22.5" cy="22" r="2.2" />
                    <path d="M8 9.5c1.3-2.2 3.4-3.6 6.2-3.8" />
                  </svg>
                </span>
              </span>
              <div>
                <h3>Быстрая доставка</h3>
                <p>Доставим товар в течение 24-48 часов</p>
              </div>
            </div>

            <div className="feature-item">
              <span className="feature-icon feature-icon-payment">
                <span className="feature-icon-mark" aria-hidden="true">
                  <svg className="feature-icon-svg" viewBox="0 0 32 32">
                    <rect x="5" y="9" width="22" height="14" rx="3" />
                    <path d="M5 13.5h22" />
                    <path d="M10 19h4" />
                    <path d="M19.5 19h3.5" />
                  </svg>
                </span>
              </span>
              <div>
                <h3>Безопасные платежи</h3>
                <p>Все транзакции защищены и конфиденциальны</p>
              </div>
            </div>

            <div className="feature-item">
              <span className="feature-icon feature-icon-return">
                <span className="feature-icon-mark" aria-hidden="true">
                  <svg className="feature-icon-svg" viewBox="0 0 32 32">
                    <path d="M11 12H6V7" />
                    <path d="M6.5 12c1.9-3.6 5.5-5.8 9.8-5.8C22.8 6.2 28 10.8 28 16.5S22.8 26.8 16.3 26.8c-4.5 0-8.4-2.1-10.6-5.5" />
                    <path d="M16 11.5v5l3.8 2.2" />
                  </svg>
                </span>
              </span>
              <div>
                <h3>Гарантия возврата</h3>
                <p>30 дней для возврата любого товара</p>
              </div>
            </div>

            <div className="feature-item">
              <span className="feature-icon feature-icon-support">
                <span className="feature-icon-mark" aria-hidden="true">
                  <svg className="feature-icon-svg" viewBox="0 0 32 32">
                    <path d="M10 22v-5.5a6 6 0 0 1 12 0V22" />
                    <rect x="7" y="18" width="4" height="7" rx="2" />
                    <rect x="21" y="18" width="4" height="7" rx="2" />
                    <path d="M16 25.5c0 1.7 1.3 2.5 3 2.5h2" />
                  </svg>
                </span>
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
