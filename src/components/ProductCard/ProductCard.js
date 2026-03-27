import React from "react";
import { Link } from "react-router-dom";
import "./ProductCard.css";

const BACKEND_URL = "http://127.0.0.1:8000";
const FALLBACK_IMG = "/no-image.png";

function getImageSrc(image) {
  if (!image || typeof image !== "string") return FALLBACK_IMG;

  const t = image.trim();
  if (!t) return FALLBACK_IMG;
  if (/^\d{2,4}x\d{2,4}$/i.test(t)) return FALLBACK_IMG;

  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  if (t.startsWith("/")) return `${BACKEND_URL}${t}`;
  return `${BACKEND_URL}/${t}`;
}

export const ProductCard = ({ product, onAddToCart }) => {
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product, 1);
  };

  const imageSrc = getImageSrc(product?.image);

  return (
    <Link to={`/product/${product?.id}`} className="product-card-link">
      <div className="product-card">
        <div className="product-image">
          <img
            src={imageSrc}
            alt={product?.name || "Product image"}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMG;
            }}
          />
          {product?.discount && (
            <div className="discount-badge">-{product.discount}%</div>
          )}
        </div>

        <div className="product-info">
          <h3 className="product-name">{product?.name}</h3>

          <p className="product-category">
            {typeof product?.category === "object"
              ? product?.category?.name
              : product?.category || "Категория не указана"}
          </p>

          <div className="product-price">
            <span className="price-new">{Number(product?.price ?? 0).toFixed(0)}₽</span>
          </div>

          <button className="add-to-cart-btn" onClick={handleAddToCart}>
            Добавить в корзину
          </button>
        </div>
      </div>
    </Link>
  );
};