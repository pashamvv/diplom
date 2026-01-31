import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

export const ProductCard = ({ product, onAddToCart }) => {
  const handleAddToCart = (e) => {
    e.preventDefault();
    onAddToCart(product, 1);
  };

  return (
    <Link to={`/product/${product.id}`} className="product-card-link">
      <div className="product-card">
        {/* Изображение */}
        <div className="product-image">
          <img
            src={product.image || 'https://via.placeholder.com/250x250?text=No+Image'}
            alt={product.name}
            loading="lazy"
          />
          {product.discount && (
            <div className="discount-badge">-{product.discount}%</div>
          )}
        </div>

        {/* Информация */}
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-category">{product.category}</p>
          
          {/* Рейтинг */}
          {product.rating && (
            <div className="product-rating">
              <span className="stars">
                {'⭐'.repeat(Math.round(product.rating))}
              </span>
              <span className="rating-value">({product.rating})</span>
            </div>
          )}

          {/* Цена */}
          <div className="product-price">
            {product.discount ? (
              <>
                <span className="price-old">
                  {product.price.toFixed(0)}₽
                </span>
                <span className="price-new">
                  {(product.price * (1 - product.discount / 100)).toFixed(0)}₽
                </span>
              </>
            ) : (
              <span className="price-new">
                {product.price.toFixed(0)}₽
              </span>
            )}
          </div>

          {/* Кнопка добавления в корзину */}
          <button
            className="add-to-cart-btn"
            onClick={handleAddToCart}
          >
            Добавить в корзину
          </button>
        </div>
      </div>
    </Link>
  );
};
