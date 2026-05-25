import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { categoriesAPI } from "../../api/endpoints";
import "../Admin.css";

export const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    parent_id: "",
    is_active: true,
  });
  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await categoriesAPI.getAll();
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error loading categories:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);
  const categoryMap = useMemo(() => {
    const m = {};
    for (const c of categories) m[c.id] = c;
    return m;
  }, [categories]);

  const getParentName = (cat) => {
    if (!cat?.parent_id) return "—";
    return categoryMap[cat.parent_id]?.name || `ID ${cat.parent_id}`;
  };
  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return categories;

    return categories.filter((c) => {
      const idStr = c?.id != null ? String(c.id) : "";
      const name = (c?.name || "").toLowerCase();
      return idStr.includes(q) || name.includes(q);
    });
  }, [categories, searchQuery]);
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData({ name: "", parent_id: "", is_active: true });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setShowForm(true);
    setFormData({
      name: category.name ?? "",
      parent_id: category.parent_id != null ? String(category.parent_id) : "",
      is_active: Boolean(category.is_active),
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Вы уверены, что хотите удалить эту категорию?")) return;

    try {
      await categoriesAPI.delete(id);
      await loadCategories();
      alert("Категория удалена");
    } catch (error) {
      console.error(error);
      alert("Ошибка при удалении категории");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name.trim(),
      parent_id: formData.parent_id === "" ? null : Number(formData.parent_id),
      is_active: Boolean(formData.is_active),
    };

    if (!payload.name) return alert("Введите название категории");
    if (editingId && payload.parent_id === editingId) {
      return alert("Категория не может быть родителем сама себе");
    }

    try {
      if (editingId) {
        await categoriesAPI.update(editingId, payload);
      } else {
        await categoriesAPI.create(payload);
      }

      await loadCategories();
      resetForm();
      alert(editingId ? "Категория обновлена" : "Категория добавлена");
    } catch (error) {
      console.error("SAVE ERROR:", error?.response?.status, error?.response?.data);
      alert(
        `Ошибка при сохранении: ${error?.response?.status || ""} ` +
          `${JSON.stringify(error?.response?.data || {})}`
      );
    }
  };

  if (loading) return <div className="loading">Загрузка категорий...</div>;
  const parentOptions = categories.filter((c) => c.id !== editingId);

  return (
    <div className="admin-categories">
      <div className="admin-header">
        <h1>Управление категориями</h1>
        <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Отмена" : "Добавить категорию"}
        </button>
      </div>
      <AnimatePresence>
        {showForm && (
        <motion.div
          className="admin-modal-overlay"
          onClick={resetForm}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.div
            className="admin-modal-card"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="admin-modal-header">
              <div>
                <span className="admin-modal-caption">Категории</span>
                <h2>{editingId ? "Редактирование категории" : "Новая категория"}</h2>
                <p>Заполни основные поля и при необходимости укажи родительскую категорию.</p>
              </div>

                <button
                  type="button"
                  className="admin-modal-close"
                  onClick={resetForm}
                  aria-label="Закрыть"
                >
                  ×
                </button>
            </div>

            <form className="admin-form" onSubmit={handleSubmit}>
              <div className="admin-form-card">
                <p className="admin-form-section-title">Основная информация</p>
                <input
                  type="text"
                  name="name"
                  placeholder="Название категории"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="admin-form-card">
                <p className="admin-form-section-title">Структура и статус</p>

                <div className="form-row">
                  <select
                    name="parent_id"
                    value={formData.parent_id}
                    onChange={handleInputChange}
                  >
                    <option value="">— Без родителя —</option>
                    {parentOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        #{c.id} — {c.name}
                      </option>
                    ))}
                  </select>

                  <label className="admin-toggle-row">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                    />
                    Активная категория
                  </label>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="submit" className="btn-primary">
                  {editingId ? "Обновить" : "Добавить"}
                </button>
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Отмена
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
      <div className="admin-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Поиск по ID или названию..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      <div className="admin-stats">
        <div className="stat-item">
          <span className="stat-label">Всего категорий:</span>
          <span className="stat-value">{categories.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Отображено:</span>
          <span className="stat-value">{filteredCategories.length}</span>
        </div>
      </div>
      <div className="admin-table">
        {filteredCategories.length === 0 ? (
          <div className="empty-state">
            <p>Категорий не найдено</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ width: 80 }}>ID</th>
                <th>Название</th>
                <th style={{ width: 220 }}>Родитель</th>
                <th style={{ width: 120 }}>Активна</th>
                <th style={{ width: 140 }}>Создана</th>
                <th style={{ width: 180 }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((cat) => (
                <tr key={cat.id}>
                  <td>#{cat.id}</td>
                  <td className="category-name">{cat.name}</td>
                  <td>{getParentName(cat)}</td>
                  <td>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "6px 10px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 700,
                        background: cat.is_active ? "#dff5e1" : "#fde2e2",
                        color: cat.is_active ? "#1b7f2a" : "#b42318",
                      }}
                    >
                      {cat.is_active ? "Да" : "Нет"}
                    </span>
                  </td>
                  <td>
                    {cat.created_at
                      ? new Date(cat.created_at).toLocaleDateString("ru-RU")
                      : "—"}
                  </td>
                  <td className="actions">
                    <button className="btn-sm btn-edit" onClick={() => handleEdit(cat)}>
                      Ред.
                    </button>
                    <button className="btn-sm btn-delete" onClick={() => handleDelete(cat.id)}>
                      Удал.
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
