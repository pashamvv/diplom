import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productsAPI } from "../../api/endpoints";
import { useCart } from "../../hooks/useCart";
import { getImageSrc, FALLBACK_IMG } from "../../utils/image";
import "./Product.css";

export const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadProduct = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getById(id);

      console.log("PRODUCT FROM API:", response.data);

      setProduct(response.data);
    } catch (error) {
      console.error("Error loading product:", error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);
  const stock = useMemo(() => {
    const n = Number(product?.stock_quantity ?? 0);
    return Number.isFinite(n) ? n : 0;
  }, [product]);

  const inStock = stock > 0;
  const imagePath = useMemo(() => {
    if (!product) return null;

    const main = product?.images?.find((img) => img.is_main);

    return main?.image_path || product.image || null;
  }, [product]);

  const imageSrc = useMemo(() => getImageSrc(imagePath), [imagePath]);

  useEffect(() => {
    if (!inStock) {
      setQuantity(1);
      return;
    }

    setQuantity((q) => Math.min(Math.max(1, q), stock));
  }, [stock, inStock]);

  const handleAddToCart = () => {
    if (!product) return;

    if (!inStock) {
      alert("Товара нет в наличии");
      return;
    }

    const safeQty = Math.min(quantity, stock);

    addToCart(product, safeQty);

    alert(`${product.name} добавлен в корзину!`);
  };

  if (loading) {
    return <div className="loading-container">Загрузка товара...</div>;
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <h1>Товар не найден</h1>
        <button onClick={() => navigate("/catalog")} className="btn-back">
          Вернуться в каталог
        </button>
      </div>
    );
  }

  return (
    <div className="product-page">
      <div className="product-container">

        <button onClick={() => navigate("/catalog")} className="btn-back">
          Назад в каталог
        </button>

        <div className="product-content">

          <div className="product-image-section">
            <div className="product-image">
              <img
                src={imageSrc}
                alt={product.name}
                onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
              />
            </div>
          </div>

          <div className="product-info-section">

            <h1 className="product-title">{product.name}</h1>

            {product.category && (
              <p className="product-category">
                <strong>Категория:</strong>{" "}
                {typeof product.category === "object"
                  ? product.category?.name
                  : product.category}
              </p>
            )}

            {product.description && (
              <div className="product-description">
                <h3>Описание</h3>
                <p>{product.description}</p>
              </div>
            )}

            <div className="product-price-section">
              <div className="price">
                <span className="current-price">
                  {Number(product.price).toFixed(0)} ₽
                </span>
              </div>
            </div>
            <div className="product-stock">
              <span
                className={`stock-status ${
                  inStock ? "in-stock" : "out-of-stock"
                }`}
              >
                {inStock ? "Есть в наличии" : "Нет в наличии"}
              </span>

              {inStock && (
                <span className="stock-count">
                  ({stock} шт.)
                </span>
              )}
            </div>
            {inStock && (
              <div className="product-actions">

                <div className="quantity-selector">

                  <button
                    className="qty-btn"
                    onClick={() =>
                      setQuantity((q) => Math.max(1, q - 1))
                    }
                  >
                    −
                  </button>

                  <input
                    className="qty-input"
                    type="number"
                    value={quantity}
                    min="1"
                    max={stock}
                    onChange={(e) => {
                      const v = parseInt(e.target.value);
                      setQuantity(
                        Math.min(Math.max(1, v || 1), stock)
                      );
                    }}
                  />

                  <button
                    className="qty-btn"
                    onClick={() =>
                      setQuantity((q) => Math.min(stock, q + 1))
                    }
                  >
                    +
                  </button>

                </div>

                <button
                  onClick={handleAddToCart}
                  className="btn-add-to-cart"
                >
                  Добавить в корзину
                </button>

              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
