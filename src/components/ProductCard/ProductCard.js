import React from "react";
import { Link } from "react-router-dom";
import "./ProductCard.css";
import { getImageSrc } from "../../utils/image";
import { getProductPricing } from "../../utils/pricing";

const FALLBACK_IMG = "/no-image.png";

const pluralize = (count, one, few, many) => {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
};

const renderStars = (ratingValue) => {
  const rating = Math.round(Number(ratingValue) || 0);
  return Array.from({ length: 5 }, (_, index) => (index < rating ? "★" : "☆")).join("");
};

export const ProductCard = ({ product, onAddToCart }) => {
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product, 1);
  };

  const imageSrc = getImageSrc(product?.image);
  const { basePrice, finalPrice, discountPercent, hasDiscount } =
    getProductPricing(product, product?.discounts);
  const rating = Number(product?.average_rating || 0);
  const reviewsCount = Number(product?.reviews_count || 0);

  return (
    <Link to={`/product/${product?.id}`} className="product-card-link">
      <div className="product-card">
        <div className="product-image">
          <div className="product-image-glow" />
          <div className="product-image-stage">
            <img
              src={imageSrc}
              alt={product?.name || "Product image"}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = FALLBACK_IMG;
              }}
            />
          </div>
          {hasDiscount && (
            <div className="discount-badge">-{discountPercent}%</div>
          )}
        </div>

        <div className="product-info">
          <h3 className="product-name">{product?.name}</h3>

          {(reviewsCount > 0 || rating > 0) && (
            <div className="product-rating">
              <span className="stars">{renderStars(rating)}</span>
              <span className="rating-value">
                {rating > 0 ? rating.toFixed(1) : '0.0'} · {reviewsCount} {pluralize(reviewsCount, 'отзыв', 'отзыва', 'отзывов')}
              </span>
            </div>
          )}

          <p className="product-category">
            {typeof product?.category === "object"
              ? product?.category?.name
              : product?.category || "Категория не указана"}
          </p>

          <div className="product-price">
            {hasDiscount && (
              <span className="price-old">{basePrice.toFixed(0)}₽</span>
            )}
            <span className="price-new">{finalPrice.toFixed(0)}₽</span>
          </div>

          <button className="add-to-cart-btn" onClick={handleAddToCart}>
            Добавить в корзину
          </button>
        </div>
      </div>
    </Link>
  );
};
