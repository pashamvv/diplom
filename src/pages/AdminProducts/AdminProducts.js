import React, { useState, useEffect } from 'react';
import { productsAPI } from '../../api/endpoints';
import '../Admin.css';

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    stock: '',
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error loading products:', error);
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
        await productsAPI.update(editingId, formData);
      } else {
        await productsAPI.create(formData);
      }
      loadProducts();
      resetForm();
      alert(editingId ? 'Товар обновлён' : 'Товар добавлен');
    } catch (error) {
      alert('Ошибка при сохранении товара');
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены?')) {
      try {
        await productsAPI.delete(id);
        loadProducts();
        alert('Товар удалён');
      } catch (error) {
        alert('Ошибка при удалении товара');
        console.error(error);
      }
    }
  };

  const handleEdit = (product) => {
    setFormData(product);
    setEditingId(product.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      stock: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="loading">Загрузка товаров...</div>;
  }

  return (
    <div className="admin-products">
      <div className="admin-header">
        <h1>Управление товарами</h1>
        <button
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Отмена' : '+ Добавить товар'}
        </button>
      </div>

      {showForm && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              type="text"
              name="name"
              placeholder="Название"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <input
              type="number"
              name="price"
              placeholder="Цена"
              value={formData.price}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-row">
            <input
              type="text"
              name="category"
              placeholder="Категория"
              value={formData.category}
              onChange={handleInputChange}
            />
            <input
              type="number"
              name="stock"
              placeholder="Количество"
              value={formData.stock}
              onChange={handleInputChange}
            />
          </div>
          <textarea
            name="description"
            placeholder="Описание"
            value={formData.description}
            onChange={handleInputChange}
            rows="3"
          />
          <input
            type="url"
            name="image"
            placeholder="URL изображения"
            value={formData.image}
            onChange={handleInputChange}
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
              <th>Цена</th>
              <th>Категория</th>
              <th>Количество</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.price.toFixed(0)}₽</td>
                <td>{product.category}</td>
                <td>{product.stock}</td>
                <td>
                  <button
                    className="btn-sm btn-edit"
                    onClick={() => handleEdit(product)}
                  >
                    Редактировать
                  </button>
                  <button
                    className="btn-sm btn-delete"
                    onClick={() => handleDelete(product.id)}
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
