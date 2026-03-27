import React, { useEffect, useMemo, useState } from "react";
import { productsAPI, categoriesAPI } from "../../api/endpoints";
import "./Admin.css";

const BACKEND_ORIGIN = "http://127.0.0.1:8000";

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock_quantity: "",
    is_active: true,
    category_id: "",
    image: null,
  });

  const loadAll = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        productsAPI.getAll(),
        categoriesAPI.getAll(),
      ]);

      setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
      setCategories(Array.isArray(catRes.data) ? catRes.data : []);
    } catch (error) {
      console.error("Load error:", error?.response?.status, error?.response?.data);
      alert("Ошибка загрузки товаров/категорий");
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const categoryMap = useMemo(() => {
    const m = {};
    for (const c of categories) m[c.id] = c.name;
    return m;
  }, [categories]);

  const getCategoryId = (p) => p?.category?.id ?? p?.category_id ?? null;

  const getCategoryName = (p) => {
    const cid = getCategoryId(p);
    if (!cid) return "—";
    return categoryMap[cid] || `ID ${cid}`;
  };

  const getStock = (p) => Number(p?.stock_quantity ?? 0);
  const getPrice = (p) => Number(p?.price ?? 0);

  const getImageCandidate = (p) => {
    if (p?.image_url) return p.image_url;
    if (p?.image_path) return p.image_path;
    if (p?.image) return p.image;
    if (p?.main_image?.image_path) return p.main_image.image_path;
    if (p?.main_image?.image_url) return p.main_image.image_url;

    const arr = p?.images || p?.product_images || [];
    if (Array.isArray(arr) && arr.length) {
      const main = arr.find((x) => x?.is_main) || arr[0];
      return main?.image_url || main?.image_path || null;
    }
    return null;
  };

  const normalizeImageSrc = (raw) => {
    if (!raw || typeof raw !== "string") return null;

    const t = raw.trim();
    if (!t) return null;
    if (/^\d{2,4}x\d{2,4}$/i.test(t)) return null;

    if (t.startsWith("http://") || t.startsWith("https://")) return t;
    if (t.startsWith("/")) return `${BACKEND_ORIGIN}${t}`;
    if (t.startsWith("static/")) return `${BACKEND_ORIGIN}/${t}`;
    return `${BACKEND_ORIGIN}/${t}`;
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      stock_quantity: "",
      is_active: true,
      category_id: "",
      image: null,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      stock_quantity: "",
      is_active: true,
      category_id: "",
      image: null,
    });
    setEditingId(null);
    setShowModal(false);
  };

  const filteredProducts = useMemo(() => {
    let arr = [...products];

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      arr = arr.filter((p) => {
        const idStr = p?.id != null ? String(p.id) : "";
        const name = (p?.name || "").toLowerCase();
        const desc = (p?.description || "").toLowerCase();
        return idStr.includes(q) || name.includes(q) || desc.includes(q);
      });
    }

    if (filterCategoryId) {
      const cid = Number(filterCategoryId);
      arr = arr.filter((p) => Number(getCategoryId(p)) === cid);
    }

    return arr;
  }, [products, searchQuery, filterCategoryId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "file"
          ? files?.[0] ?? null
          : value,
    }));
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name ?? "",
      description: product.description ?? "",
      price: String(product.price ?? ""),
      stock_quantity: String(product.stock_quantity ?? ""),
      is_active: Boolean(product.is_active),
      category_id: String(getCategoryId(product) ?? ""),
      image: null,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Вы уверены, что хотите удалить этот товар?")) return;

    try {
      await productsAPI.delete(id);
      await loadAll();
      alert("Товар удалён");
    } catch (error) {
      console.error("DELETE ERROR:", error?.response?.status, error?.response?.data);
      alert("Ошибка при удалении товара");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name.trim(),
      description: (formData.description || "").trim(),
      price: Number(formData.price),
      stock_quantity: Number(formData.stock_quantity),
      is_active: Boolean(formData.is_active),
      category_id: Number(formData.category_id),
    };

    if (!payload.name) return alert("Введите название");
    if (!payload.category_id) return alert("Выберите категорию");
    if (Number.isNaN(payload.price)) return alert("Некорректная цена");
    if (Number.isNaN(payload.stock_quantity)) return alert("Некорректное количество");

    try {
      let productId = editingId;

      if (editingId) {
        await productsAPI.update(editingId, payload);
      } else {
        const res = await productsAPI.create(payload);
        productId = res.data?.id;
      }

      if (formData.image && productId) {
        await productsAPI.uploadImage(productId, formData.image);
      }

      await loadAll();
      closeModal();
      alert(editingId ? "Товар обновлён" : "Товар добавлен");
    } catch (error) {
      console.error("SAVE ERROR:", error?.response?.status, error?.response?.data);
      alert(
        `Ошибка при сохранении: ${error?.response?.status || ""} ` +
          `${JSON.stringify(error?.response?.data || {})}`
      );
    }
  };

  if (loading) {
    return (
      <div className="ios-admin-shell">
        <div className="ios-loading-card">Загрузка товаров...</div>
      </div>
    );
  }

  return (
    <div className="ios-admin-shell">
      <div className="ios-admin-bg" />

      <div className="ios-admin-header glass-card">
        <div>
          <div className="ios-caption">Админ-панель</div>
          <h1>Управление товарами</h1>
          <p></p>
        </div>

        <button className="ios-primary-btn" onClick={openCreateModal}>
          + Добавить товар
        </button>
      </div>

      <div className="ios-toolbar glass-card">
        <div className="ios-search-wrap">
          <input
            type="text"
            placeholder="Поиск по ID, названию или описанию"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ios-search-input"
          />
        </div>

        <div className="ios-filter-wrap">
          <select
            value={filterCategoryId}
            onChange={(e) => setFilterCategoryId(e.target.value)}
            className="ios-filter-select"
          >
            <option value="">Все категории</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="ios-stats-grid">
        <div className="glass-card ios-stat-card">
          <span>Всего товаров</span>
          <strong>{products.length}</strong>
        </div>

        <div className="glass-card ios-stat-card">
          <span>Отображено</span>
          <strong>{filteredProducts.length}</strong>
        </div>

        <div className="glass-card ios-stat-card">
          <span>На складе</span>
          <strong>{products.reduce((sum, p) => sum + getStock(p), 0)}</strong>
        </div>

        <div className="glass-card ios-stat-card">
          <span>Сумма товаров</span>
          <strong>
            {products.reduce((sum, p) => sum + getPrice(p) * getStock(p), 0).toFixed(0)}₽
          </strong>
        </div>
      </div>

      <div className="glass-card ios-table-card">
        {filteredProducts.length === 0 ? (
          <div className="ios-empty-state">
            <div className="ios-empty-icon">ТВР</div>
            <p>Товаров не найдено</p>
          </div>
        ) : (
          <div className="ios-table-wrap">
            <table className="ios-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Фото</th>
                  <th>Название</th>
                  <th>Цена</th>
                  <th>Категория</th>
                  <th>Склад</th>
                  <th>Статус</th>
                  <th>Создан</th>
                  <th>Действия</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => {
                  const stock = getStock(product);
                  const price = getPrice(product);
                  const rawImg = getImageCandidate(product);
                  const imgSrc = normalizeImageSrc(rawImg);

                  return (
                    <tr key={product.id}>
                      <td className="muted">#{product.id}</td>

                      <td>
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={product.name}
                            className="ios-table-image"
                            onError={(e) => {
                              e.currentTarget.src =
                                "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
                            }}
                          />
                        ) : (
                          <div className="ios-no-image">—</div>
                        )}
                      </td>

                      <td>
                        <div className="ios-product-name">{product.name}</div>
                        <div className="ios-product-desc">
                          {product.description || "Без описания"}
                        </div>
                      </td>

                      <td className="ios-price">{price.toFixed(0)}₽</td>
                      <td>{getCategoryName(product)}</td>
                      <td className="ios-stock">{stock}</td>

                      <td>
                        <span className={`ios-badge ${product.is_active ? "active" : "inactive"}`}>
                          {product.is_active ? "Активен" : "Выключен"}
                        </span>
                      </td>

                      <td>
                        {product.created_at
                          ? new Date(product.created_at).toLocaleDateString("ru-RU")
                          : "—"}
                      </td>

                      <td>
                        <div className="ios-actions">
                          <button className="ios-mini-btn edit" onClick={() => handleEdit(product)}>
                            Ред.
                          </button>
                          <button className="ios-mini-btn delete" onClick={() => handleDelete(product.id)}>
                            Удал.
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="ios-modal-overlay" onClick={closeModal}>
          <div className="ios-modal glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="ios-modal-header">
              <div>
                <div className="ios-caption">
                  {editingId ? "Редактирование" : "Новый товар"}
                </div>
                <h2>{editingId ? "Изменить товар" : "Добавить товар"}</h2>
              </div>

              <button className="ios-close-btn" onClick={closeModal}>
                Закрыть
              </button>
            </div>

            <form className="ios-form" onSubmit={handleSubmit}>
              <div className="ios-grid two">
                <div className="ios-field">
                  <label>Название</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Например: iPhone 16 Pro"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="ios-field">
                  <label>Цена</label>
                  <input
                    type="number"
                    name="price"
                    placeholder="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="ios-grid two">
                <div className="ios-field">
                  <label>Категория</label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Выберите категорию</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="ios-field">
                  <label>Количество на складе</label>
                  <input
                    type="number"
                    name="stock_quantity"
                    placeholder="0"
                    value={formData.stock_quantity}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="ios-field">
                <label>Описание</label>
                <textarea
                  name="description"
                  placeholder="Краткое описание товара"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                />
              </div>

              <div className="ios-grid two align-end">
                <div className="ios-field">
                  <label>Изображение</label>
                  <input type="file" name="image" accept="image/*" onChange={handleInputChange} />
                </div>

                <label className="ios-switch-row">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                  />
                  <span>Активный товар</span>
                </label>
              </div>

              {formData.image && (
                <div className="ios-preview-wrap">
                  <img
                    src={URL.createObjectURL(formData.image)}
                    alt="preview"
                    className="ios-preview-image"
                  />
                </div>
              )}

              <div className="ios-form-actions">
                <button type="submit" className="ios-primary-btn">
                  {editingId ? "Сохранить" : "Добавить"}
                </button>
                <button type="button" className="ios-secondary-btn" onClick={closeModal}>
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
