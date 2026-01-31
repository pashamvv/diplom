import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { useCart } from '../../hooks/useCart';
import { productsAPI, categoriesAPI } from '../../api/endpoints';
import './Catalog.css';

export const Catalog = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || 'all'
  );
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const { addToCart } = useCart();

  const searchQuery = searchParams.get('search') || '';

  // Загрузка товаров
  useEffect(() => {
    loadProducts();
  }, [selectedCategory, searchQuery, priceRange]);

  // Загрузка категорий
  useEffect(() => {
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = {
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        search: searchQuery || undefined,
        min_price: priceRange[0],
        max_price: priceRange[1],
      };
      const response = await productsAPI.getAll(params);
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleAddToCart = (product, quantity) => {
    addToCart(product, quantity);
    alert(`${product.name} добавлен в корзину!`);
  };

  return (
    <div className="catalog-page">
      <div className="catalog-container">
        {/* Фильтры */}
        <aside className="catalog-sidebar">
          <h3>Фильтры</h3>

          {/* Категории */}
          <div className="filter-group">
            <h4>Категории</h4>
            <label className="filter-item">
              <input
                type="radio"
                name="category"
                value="all"
                checked={selectedCategory === 'all'}
                onChange={(e) => setSelectedCategory(e.target.value)}
              />
              <span>Все товары</span>
            </label>
            {categories.map((cat) => (
              <label key={cat.id} className="filter-item">
                <input
                  type="radio"
                  name="category"
                  value={cat.id}
                  checked={selectedCategory === cat.id.toString()}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                />
                <span>{cat.name}</span>
              </label>
            ))}
          </div>

          {/* Цена */}
          <div className="filter-group">
            <h4>Цена (₽)</h4>
            <div className="price-inputs">
              <input
                type="number"
                placeholder="От"
                value={priceRange[0]}
                onChange={(e) =>
                  setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])
                }
              />
              <span>-</span>
              <input
                type="number"
                placeholder="До"
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], parseInt(e.target.value) || 500000])
                }
              />
            </div>
          </div>
        </aside>

        {/* Товары */}
        <main className="catalog-main">
          <div className="catalog-header">
            <h1>Каталог</h1>
            {searchQuery && <p className="search-info">Результаты поиска: "{searchQuery}"</p>}
          </div>

          {loading ? (
            <div className="loading">Загрузка товаров...</div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <p>К сожалению, товаров не найдено</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
