import React, { useState, useEffect } from 'react';
import { discountsAPI } from '../../api/endpoints';
import '../Admin.css';

export const AdminDiscounts = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    discount_percent: '',
    expiry_date: '',
  });

  useEffect(() => {
    loadDiscounts();
  }, []);

  const loadDiscounts = async () => {
    try {
      const response = await discountsAPI.getAll();
      setDiscounts(response.data || []);
    } catch (error) {
      console.error('Error loading discounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await discountsAPI.create(formData);
      loadDiscounts();
      setFormData({ name: '', code: '', discount_percent: '', expiry_date: '' });
      setShowForm(false);
      alert('Скидка добавлена');
    } catch (error) {
      alert('Ошибка при создании скидки');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены?')) {
      try {
        await discountsAPI.delete(id);
        loadDiscounts();
        alert('Скидка удалена');
      } catch (error) {
        alert('Ошибка при удалении скидки');
      }
    }
  };

  if (loading) {
    return <div className="loading">Загрузка скидок...</div>;
  }

  return (
    <div className="admin-discounts">
      <div className="admin-header">
        <h1>Управление скидками</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Отмена' : '+ Добавить скидку'}
        </button>
      </div>

      {showForm && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              type="text"
              name="name"
              placeholder="Название скидки"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="code"
              placeholder="Код скидки"
              value={formData.code}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-row">
            <input
              type="number"
              name="discount_percent"
              placeholder="Процент скидки"
              value={formData.discount_percent}
              onChange={handleInputChange}
              required
            />
            <input
              type="date"
              name="expiry_date"
              value={formData.expiry_date}
              onChange={handleInputChange}
            />
          </div>
          <button type="submit" className="btn-primary">
            Добавить
          </button>
        </form>
      )}

      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Код</th>
              <th>Скидка</th>
              <th>Срок</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {discounts.map((discount) => (
              <tr key={discount.id}>
                <td>{discount.id}</td>
                <td>{discount.name}</td>
                <td>{discount.code}</td>
                <td>{discount.discount_percent}%</td>
                <td>{new Date(discount.expiry_date).toLocaleDateString('ru-RU')}</td>
                <td>
                  <button
                    className="btn-sm btn-delete"
                    onClick={() => handleDelete(discount.id)}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
