import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import './CartPage.css';

const BACKEND_URL = 'http://127.0.0.1:8000';
const FALLBACK_IMG = '/no-image.png';

const getImageSrc = (image) => {
  if (!image || typeof image !== 'string') return FALLBACK_IMG;

  const t = image.trim();
  if (!t) return FALLBACK_IMG;

  if (t.startsWith('http://') || t.startsWith('https://')) return t;
  if (t.startsWith('/')) return `${BACKEND_URL}${t}`;

  return `${BACKEND_URL}/${t}`;
};

export const CartPage = () => {
  const { cart, removeFromCart, getTotalPrice, createOrder } = useCart();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!cart.length) {
      alert('Корзина пуста');
      return;
    }

    setLoading(true);

    try {
      const result = await createOrder();

      if (!result?.success) {
        alert(result?.message || 'Ошибка при создании заказа');
        return;
      }

      alert(result.message || 'Заказ успешно создан!');
      navigate('/orders');
    } catch (error) {
      console.error('Ошибка при создании заказа:', error);
      alert(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          'Ошибка при создании заказа'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!cart || cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="empty-cart">
          <p className="empty-icon">Корзина</p>
          <h2>Корзина пуста</h2>
          <p>Добавьте товары из каталога</p>
          <button
            className="continue-shopping-btn"
            onClick={() => navigate('/catalog')}
          >
            Перейти в каталог
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1>Корзина</h1>

        <div className="cart-content">
          <div className="cart-items">
            {cart.map((item) => {
              const product = item.product || item;
              const name = product?.name || 'Без названия';
              const price = Number(product?.price ?? item.price ?? 0);
              const quantity = Number(item.quantity ?? 1);
              const imageSrc = getImageSrc(product?.image ?? item.image);

              return (
                <div key={item.id} className="cart-item">
                  <img
                    src={imageSrc}
                    alt={name}
                    className="item-image"
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_IMG;
                    }}
                  />

                  <div className="item-info">
                    <h3>{name}</h3>
                    <p className="item-price">{price.toFixed(0)}₽</p>
                    <p className="item-quantity-text">Количество: {quantity}</p>
                  </div>

                  <div className="item-total">
                    {(price * quantity).toFixed(0)}₽
                  </div>

                  <button
                    className="remove-btn"
                    onClick={async () => {
                      const result = await removeFromCart(item.id);

                      if (!result?.success) {
                        alert(result?.message || 'Ошибка удаления товара');
                      }
                    }}
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>

          <aside className="cart-summary">
            <h2>Сводка</h2>

            <div className="summary-row">
              <span>Товаров:</span>
              <span>
                {cart.reduce((sum, item) => sum + Number(item.quantity ?? 0), 0)}
              </span>
            </div>

            <div className="summary-row">
              <span>Подитог:</span>
              <span>{getTotalPrice().toFixed(0)}₽</span>
            </div>

            <div className="summary-row">
              <span>Доставка:</span>
              <span>Бесплатно</span>
            </div>

            <div className="summary-total">
              <span>Итого:</span>
              <span>{getTotalPrice().toFixed(0)}₽</span>
            </div>

            <button
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? 'Обработка...' : 'Оформить заказ'}
            </button>

            <button
              className="continue-shopping-btn"
              onClick={() => navigate('/catalog')}
            >
              Продолжить покупки
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
};
