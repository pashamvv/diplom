import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productsAPI, reviewsAPI } from "../../api/endpoints";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import { getImageSrc, FALLBACK_IMG } from "../../utils/image";
import "./Product.css";

const normalizeReview = (review) => ({
  id: Number(review?.id ?? 0),
  user_id: Number(review?.user_id ?? review?.user?.id ?? 0),
  rating: Number(review?.rating ?? 0),
  comment: review?.comment ?? "",
  user_name:
    review?.user_name ??
    review?.author_name ??
    review?.user?.full_name ??
    review?.user?.name ??
    review?.user?.email ??
    review?.email ??
    "Покупатель",
  user_email:
    review?.user_email ??
    review?.user?.email ??
    review?.email ??
    "",
  created_at: review?.created_at ?? null,
  updated_at: review?.updated_at ?? null,
});

const getErrorMessage = (error, fallback = "Произошла ошибка") => {
  const status = error?.response?.status;
  const detail = error?.response?.data?.detail;
  const message = error?.response?.data?.message;
  const rawMessage = String(error?.message || "");

  if (status === 403) {
    return "Отзыв можно оставить только после покупки товара или когда заказ ещё не подходит под правило бэкенда.";
  }

  if (
    rawMessage.includes("Network Error") ||
    rawMessage.includes("ERR_NETWORK") ||
    rawMessage.includes("CORS")
  ) {
    return "Сервер отзывов ответил с ошибкой CORS/500. Это уже проблема бэкенда, а не формы на сайте.";
  }

  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((item) => item?.msg || String(item)).join(", ");
  if (typeof message === "string") return message;

  return fallback;
};

const pluralize = (count, one, few, many) => {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
};

const formatReviewsCount = (count) =>
  `${count} ${pluralize(count, "отзыв", "отзыва", "отзывов")}`;

const renderStars = (ratingValue) => {
  const rating = Math.round(Number(ratingValue) || 0);
  return Array.from({ length: 5 }, (_, index) => (index < rating ? "★" : "☆")).join("");
};

export const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: "" });
  const [reviewNotice, setReviewNotice] = useState({ type: "", text: "" });
  const [savingReview, setSavingReview] = useState(false);
  const [deletingReview, setDeletingReview] = useState(false);

  const loadProduct = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) {
          setLoading(true);
        }
        const response = await productsAPI.getById(id);
        setProduct(response.data);
      } catch (error) {
        console.error("Error loading product:", error);
        setProduct(null);
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    [id]
  );

  const loadReviews = useCallback(async () => {
    try {
      setReviewsLoading(true);
      const response = await reviewsAPI.getByProduct(id);
      const source = response?.data;
      const items = Array.isArray(source)
        ? source
        : source?.items || source?.reviews || source?.data || [];

      setReviews(items.map(normalizeReview));
    } catch (error) {
      console.error("Error loading reviews:", error);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
    loadReviews();
  }, [loadProduct, loadReviews]);

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
  const currentUserId = Number(user?.id ?? user?.user_id ?? 0);
  const currentUserEmail = String(user?.email ?? "").toLowerCase();

  const myReview = useMemo(() => {
    return (
      reviews.find((review) => {
        if (currentUserId > 0 && review.user_id === currentUserId) {
          return true;
        }

        return (
          currentUserEmail &&
          String(review.user_email || "").toLowerCase() === currentUserEmail
        );
      }) || null
    );
  }, [currentUserEmail, currentUserId, reviews]);

  const ratingStats = useMemo(() => {
    const fallbackCount = Number(product?.reviews_count || 0);
    const fallbackAverage = Number(product?.average_rating || 0);

    if (!reviews.length) {
      return {
        count: fallbackCount,
        average: fallbackAverage,
      };
    }

    const count = reviews.length;
    const average =
      reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / count;

    return {
      count,
      average,
    };
  }, [product?.average_rating, product?.reviews_count, reviews]);

  useEffect(() => {
    if (!inStock) {
      setQuantity(1);
      return;
    }

    setQuantity((q) => Math.min(Math.max(1, q), stock));
  }, [stock, inStock]);

  useEffect(() => {
    if (myReview) {
      setReviewForm({
        rating: Number(myReview.rating || 0),
        comment: myReview.comment || "",
      });
      return;
    }

    setReviewForm({ rating: 0, comment: "" });
  }, [myReview]);

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

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!reviewForm.rating) {
      setReviewNotice({ type: "error", text: "Поставь оценку от 1 до 5" });
      return;
    }

    try {
      setSavingReview(true);
      setReviewNotice({ type: "", text: "" });

      const payload = {
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment.trim(),
      };

      if (myReview?.id) {
        await reviewsAPI.update(myReview.id, payload);
      } else {
        await reviewsAPI.create(id, payload);
      }

      await Promise.all([loadReviews(), loadProduct(false)]);
      setReviewNotice({
        type: "success",
        text: myReview ? "Отзыв обновлён" : "Отзыв опубликован",
      });
    } catch (error) {
      console.error("Ошибка сохранения отзыва:", error);
      setReviewNotice({
        type: "error",
        text: getErrorMessage(error, "Не удалось сохранить отзыв"),
      });
    } finally {
      setSavingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!myReview?.id) return;
    if (!window.confirm("Удалить ваш отзыв?")) return;

    try {
      setDeletingReview(true);
      setReviewNotice({ type: "", text: "" });
      await reviewsAPI.delete(myReview.id);
      await Promise.all([loadReviews(), loadProduct(false)]);
      setReviewNotice({ type: "success", text: "Отзыв удалён" });
    } catch (error) {
      console.error("Ошибка удаления отзыва:", error);
      setReviewNotice({
        type: "error",
        text: getErrorMessage(error, "Не удалось удалить отзыв"),
      });
    } finally {
      setDeletingReview(false);
    }
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

            <div className="product-rating">
              <span className="stars">{renderStars(ratingStats.average)}</span>
              <span className="rating-value">
                {ratingStats.count > 0
                  ? `${ratingStats.average.toFixed(1)} · ${formatReviewsCount(ratingStats.count)}`
                  : "Пока без отзывов"}
              </span>
            </div>

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
              <span className={`stock-status ${inStock ? "in-stock" : "out-of-stock"}`}>
                {inStock ? "Есть в наличии" : "Нет в наличии"}
              </span>

              {inStock && <span className="stock-count">({stock} шт.)</span>}
            </div>

            {inStock && (
              <div className="product-actions">
                <div className="quantity-selector">
                  <button className="qty-btn" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                    −
                  </button>

                  <input
                    className="qty-input"
                    type="number"
                    value={quantity}
                    min="1"
                    max={stock}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      setQuantity(Math.min(Math.max(1, v || 1), stock));
                    }}
                  />

                  <button className="qty-btn" onClick={() => setQuantity((q) => Math.min(stock, q + 1))}>
                    +
                  </button>
                </div>

                <button onClick={handleAddToCart} className="btn-add-to-cart">
                  Добавить в корзину
                </button>
              </div>
            )}
          </div>
        </div>

        <section className="product-reviews-section">
          <div className="product-reviews-head">
            <div>
              <span className="reviews-kicker">Отзывы покупателей</span>
              <h2>Отзывы и рейтинг</h2>
              <p>Оставлять отзыв могут только пользователи, которые уже покупали этот товар.</p>
            </div>

            <div className="product-reviews-summary">
              <strong>{ratingStats.count > 0 ? ratingStats.average.toFixed(1) : "—"}</strong>
              <span>{ratingStats.count > 0 ? formatReviewsCount(ratingStats.count) : "Пока пусто"}</span>
            </div>
          </div>

          {reviewNotice.text && (
            <div className={`review-notice ${reviewNotice.type === "error" ? "error" : "success"}`}>
              {reviewNotice.text}
            </div>
          )}

          <div className="product-reviews-grid">
            <div className="product-review-form-card">
              <h3>{myReview ? "Ваш отзыв" : "Оставить отзыв"}</h3>

              {isAuthenticated ? (
                <form className="product-review-form" onSubmit={handleReviewSubmit}>
                  <div className="review-stars-input">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        className={`review-star-btn ${value <= reviewForm.rating ? "active" : ""}`}
                        onClick={() => setReviewForm((prev) => ({ ...prev, rating: value }))}
                      >
                        ★
                      </button>
                    ))}
                    <span className="review-rating-caption">
                      {reviewForm.rating ? `${reviewForm.rating} из 5` : "Выберите оценку"}
                    </span>
                  </div>

                  <textarea
                    className="review-textarea"
                    placeholder="Расскажите, что понравилось или что можно улучшить"
                    value={reviewForm.comment}
                    onChange={(e) =>
                      setReviewForm((prev) => ({
                        ...prev,
                        comment: e.target.value,
                      }))
                    }
                    rows="5"
                  />

                  <div className="review-form-actions">
                    <button type="submit" className="btn-add-to-cart" disabled={savingReview}>
                      {savingReview
                        ? "Сохраняю..."
                        : myReview
                          ? "Обновить отзыв"
                          : "Опубликовать отзыв"}
                    </button>

                    {myReview && (
                      <button
                        type="button"
                        className="review-danger-btn"
                        onClick={handleDeleteReview}
                        disabled={deletingReview}
                      >
                        {deletingReview ? "Удаляю..." : "Удалить отзыв"}
                      </button>
                    )}
                  </div>
                </form>
              ) : (
                <div className="review-empty">
                  Чтобы оставить отзыв, войдите в аккаунт и купите этот товар.
                </div>
              )}
            </div>

            <div className="product-reviews-list-card">
              <h3>Что пишут покупатели</h3>

              {reviewsLoading ? (
                <div className="review-empty">Загрузка отзывов...</div>
              ) : reviews.length === 0 ? (
                <div className="review-empty">Пока никто не оставил отзыв</div>
              ) : (
                <div className="review-list">
                  {reviews.map((review) => (
                    <article key={review.id} className="review-card">
                      <div className="review-card-head">
                        <div>
                          <strong>{review.user_name}</strong>
                          <span>{review.created_at ? new Date(review.created_at).toLocaleDateString("ru-RU") : "—"}</span>
                        </div>
                        <span className="stars">{renderStars(review.rating)}</span>
                      </div>
                      <p>{review.comment || "Пользователь оставил только оценку без текста."}</p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
