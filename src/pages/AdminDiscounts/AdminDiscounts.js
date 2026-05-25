import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { discountsAPI, productsAPI } from '../../api/endpoints';
import { isDiscountActive, toDateInputValue } from '../../utils/pricing';
import '../Admin.css';

export const AdminDiscounts = () => {
  const [discounts, setDiscounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    product_id: '',
    discount_percent: '',
    start_date: '',
    end_date: '',
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [discountsRes, productsRes] = await Promise.all([
        discountsAPI.getAll(),
        productsAPI.getAll(),
      ]);

      console.log('DISCOUNTS RAW:', discountsRes?.data);
      console.log('PRODUCTS RAW:', productsRes?.data);

      const discountsData = Array.isArray(discountsRes?.data)
        ? discountsRes.data
        : discountsRes?.data?.items || [];

      const productsData = Array.isArray(productsRes?.data)
        ? productsRes.data
        : productsRes?.data?.items || [];

      setDiscounts(discountsData);
      setProducts(productsData);
    } catch (error) {
      console.error('Ошибка загрузки скидок:', error);
      console.error('Ответ скидок:', error?.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const productMap = useMemo(() => {
    const map = {};
    for (const p of products) {
      map[p.id] = p;
    }
    return map;
  }, [products]);

  const filteredDiscounts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return discounts;

    return discounts.filter((d) => {
      const productName = productMap[d.product_id]?.name?.toLowerCase() || '';
      return (
        String(d.product_id).includes(q) ||
        productName.includes(q) ||
        String(d.discount_percent ?? '').includes(q)
      );
    });
  }, [discounts, productMap, searchQuery]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      product_id: '',
      discount_percent: '',
      start_date: '',
      end_date: '',
      is_active: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setShowForm(true);
    setFormData({
      product_id: '',
      discount_percent: '',
      start_date: '',
      end_date: '',
      is_active: true,
    });
  };

  const handleEdit = (discount) => {
    setEditingId(discount.id);
    setShowForm(true);
    setFormData({
      product_id: String(discount.product_id ?? ''),
      discount_percent: String(discount.discount_percent ?? ''),
      start_date: toDateInputValue(discount.start_date),
      end_date: toDateInputValue(discount.end_date),
      is_active: ![false, 0, '0', 'false', 'inactive'].includes(discount.is_active),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      product_id: Number(formData.product_id),
      discount_percent: Number(formData.discount_percent),
      start_date: formData.start_date,
      end_date: formData.end_date || null,
      is_active: Boolean(formData.is_active),
    };

    try {
      if (editingId) {
        await discountsAPI.update(editingId, payload);
      } else {
        await discountsAPI.create(payload);
      }

      alert(editingId ? 'Скидка обновлена' : 'Скидка добавлена');
      await loadData();
      resetForm();
    } catch (error) {
      console.error('Ошибка при сохранении скидки:', error);
      alert(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          'Ошибка при сохранении скидки'
      );
    }
  };

  if (loading) {
    return <div className="loading">Загрузка скидок...</div>;
  }

  return (
    <div className="admin-discounts">
      <div className="admin-header">
        <h1>Управление скидками</h1>
        <button className="btn-primary" onClick={openCreateModal}>
          + Добавить скидку
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
                <span className="admin-modal-caption">Скидки</span>
                <h2>{editingId ? 'Редактирование скидки' : 'Новая скидка'}</h2>
                <p>Настрой товар, размер скидки и период действия в одном окне.</p>
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
                <p className="admin-form-section-title">Основные параметры</p>

                <div className="form-row">
                  <select
                    name="product_id"
                    value={formData.product_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Выберите товар</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} (ID: {product.id})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    name="discount_percent"
                    placeholder="Процент скидки"
                    min="1"
                    max="100"
                    value={formData.discount_percent}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-card">
                <p className="admin-form-section-title">Срок действия</p>

                <div className="form-row">
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="admin-form-card">
                <p className="admin-form-section-title">Состояние скидки</p>

                <label className="admin-toggle-row">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                  />
                  Скидка активна
                </label>
              </div>

              <div className="admin-modal-footer">
                <button type="submit" className="btn-primary">
                  {editingId ? 'Обновить' : 'Добавить'}
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
            placeholder="Поиск по товару, ID или проценту..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="admin-stats">
        <div className="stat-item">
          <span className="stat-label">Всего скидок:</span>
          <span className="stat-value">{discounts.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Активных:</span>
          <span className="stat-value">
            {discounts.filter((d) => isDiscountActive(d)).length}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Отображено:</span>
          <span className="stat-value">{filteredDiscounts.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Средняя скидка:</span>
          <span className="stat-value">
            {discounts.length
              ? (
                  discounts.reduce((sum, d) => sum + Number(d.discount_percent || 0), 0) /
                  discounts.length
                ).toFixed(0)
              : 0}
            %
          </span>
        </div>
      </div>

      <div className="admin-table">
        {filteredDiscounts.length === 0 ? (
          <div className="empty-state">
            <p>Скидок не найдено</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Товар</th>
                <th>Процент</th>
                <th>Дата начала</th>
                <th>Дата окончания</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredDiscounts.map((discount) => {
                const isActive = isDiscountActive(discount);
                const product = productMap[discount.product_id];

                return (
                  <tr key={discount.id}>
                    <td>{discount.id}</td>
                    <td>{product?.name || `Товар ID ${discount.product_id}`}</td>
                    <td>{discount.discount_percent}%</td>
                    <td>
                      {discount.start_date
                        ? new Date(discount.start_date).toLocaleDateString('ru-RU')
                        : '—'}
                    </td>
                    <td>
                      {discount.end_date
                        ? new Date(discount.end_date).toLocaleDateString('ru-RU')
                        : '—'}
                    </td>
                    <td>
                      <span className={`status ${isActive ? 'in-stock' : 'out-of-stock'}`}>
                        {isActive ? 'Активна' : 'Неактивна'}
                      </span>
                    </td>
                    <td className="actions">
                      <button className="btn-sm btn-edit" onClick={() => handleEdit(discount)}>
                        Ред.
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
