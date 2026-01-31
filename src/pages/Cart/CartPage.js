import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { ordersAPI } from '../../api/endpoints';
import './CartPage.css';

export const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, clearCart } =
    useCart();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        totalPrice: getTotalPrice(),
      };
      await ordersAPI.create(orderData);
      clearCart();
      alert('Заказ успешно создан!');
      navigate('/orders');
    } catch (error) {
      alert('Ошибка при создании заказа');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="empty-cart">
          <p className="empty-icon">🛒</p>
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
          {/* Товары */}
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <img
                  src={item.image || 'https://via.placeholder.com/100x100?text=No+Image'}
                  alt={item.name}
                  className="item-image"
                />
                <div className="item-info">
                  <h3>{item.name}</h3>
                  <p className="item-price">{item.price.toFixed(0)}₽</p>
                </div>
                <div className="item-quantity">
                  <button
                    onClick={() =>
                      updateQuantity(item.id, item.quantity - 1)
                    }
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.id, parseInt(e.target.value) || 1)
                    }
                  />
                  <button
                    onClick={() =>
                      updateQuantity(item.id, item.quantity + 1)
                    }
                  >
                    +
                  </button>
                </div>
                <div className="item-total">
                  {(item.price * item.quantity).toFixed(0)}₽
                </div>
                <button
                  className="remove-btn"
                  onClick={() => removeFromCart(item.id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Сводка */}
          <aside className="cart-summary">
            <h2>Сводка</h2>
            <div className="summary-row">
              <span>Товаров:</span>
              <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
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
