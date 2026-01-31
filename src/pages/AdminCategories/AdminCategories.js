import React, { useState, useEffect } from 'react';
import { categoriesAPI } from '../../api/endpoints';
import '../Admin.css';

export const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
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
      if (editingId) {
        await categoriesAPI.update(editingId, formData);
      } else {
        await categoriesAPI.create(formData);
      }
      loadCategories();
      resetForm();
      alert(editingId ? 'Категория обновлена' : 'Категория добавлена');
    } catch (error) {
      alert('Ошибка при сохранении категории');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены?')) {
      try {
        await categoriesAPI.delete(id);
        loadCategories();
        alert('Категория удалена');
      } catch (error) {
        alert('Ошибка при удалении категории');
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="loading">Загрузка категорий...</div>;
  }

  return (
    <div className="admin-categories">
      <div className="admin-header">
        <h1>Управление категориями</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Отмена' : '+ Добавить категорию'}
        </button>
      </div>

      {showForm && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Название категории"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <textarea
            name="description"
            placeholder="Описание"
            value={formData.description}
            onChange={handleInputChange}
            rows="3"
          />
          <button type="submit" className="btn-primary">
            {editingId ? 'Обновить' : 'Добавить'}
          </button>
        </form>
      )}

      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Описание</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td>{cat.id}</td>
                <td>{cat.name}</td>
                <td>{cat.description?.substring(0, 50)}...</td>
                <td>
                  <button
                    className="btn-sm btn-edit"
                    onClick={() => {
                      setFormData(cat);
                      setEditingId(cat.id);
                      setShowForm(true);
                    }}
                  >
                    Редактировать
                  </button>
                  <button
                    className="btn-sm btn-delete"
                    onClick={() => handleDelete(cat.id)}
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
