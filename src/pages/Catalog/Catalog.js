import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        category: selectedCategory === 'all' ? undefined : selectedCategory,
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
  }, [selectedCategory, priceRange]);

  const loadCategories = useCallback(async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts, searchQuery]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const filteredProducts = useMemo(() => {
    if (!normalizedSearchQuery) {
      return products;
    }

    return products.filter((product) => {
      const idText = String(product?.id ?? '');
      const nameText = String(product?.name ?? '').toLowerCase();
      const descriptionText = String(product?.description ?? '').toLowerCase();
      const categoryText = String(
        product?.category?.name ?? product?.category ?? ''
      ).toLowerCase();

      return (
        idText.includes(normalizedSearchQuery) ||
        nameText.includes(normalizedSearchQuery) ||
        descriptionText.includes(normalizedSearchQuery) ||
        categoryText.includes(normalizedSearchQuery)
      );
    });
  }, [products, normalizedSearchQuery]);


  const handleAddToCart = async (product, quantity = 1) => {
    try {
      console.log('Нажали добавить в корзину:', { product, quantity });

      const result = await addToCart(product, quantity);

      console.log('Результат addToCart:', result);

      if (result?.success) {
        alert(`${product.name} добавлен в корзину!`);
      } else {
        alert(result?.message || 'Не удалось добавить товар в корзину');
      }
    } catch (error) {
      console.error('Ошибка добавления товара:', error);
      alert('Ошибка добавления товара в корзину');
    }
  };

  return (
    <div className="c-page">
      <div className="c-shell">
        <div className="c-topbar">
          <div className="c-titleBlock">
            <h1 className="c-title">Каталог</h1>

            <div className="c-subtitle">
              {searchQuery ? (
                <span className="c-chip">
                  Результаты: <b>“{searchQuery}”</b>
                </span>
              ) : (
                <span className="c-chip muted">
                  Выберите категорию и диапазон цены
                </span>
              )}
            </div>
          </div>

          <div className="c-stats">
            <span className="c-pill">
              {loading ? '…' : filteredProducts.length} товаров
            </span>
          </div>
        </div>

        <div className="c-layout">
          <aside className="c-side">

            <div className="c-card">

              <div className="c-cardHead">
                <h3>Фильтры</h3>
                <span className="c-badge">nocta / magic</span>
              </div>
              <div className="c-section">
                <div className="c-sectionTitle">Категории</div>

                <label className="c-radioRow">
                  <input
                    className="c-radio"
                    type="radio"
                    name="category"
                    value="all"
                    checked={selectedCategory === 'all'}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  />
                  <span className="c-radioText">Все товары</span>
                </label>

                <div className="c-divider" />

                <div className="c-scroll">
                  {categories.map((cat) => (
                    <label key={cat.id} className="c-radioRow">

                      <input
                        className="c-radio"
                        type="radio"
                        name="category"
                        value={cat.id.toString()}
                        checked={selectedCategory === cat.id.toString()}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      />

                      <span className="c-radioText">{cat.name}</span>

                    </label>
                  ))}
                </div>
              </div>
              <div className="c-section">
                <div className="c-sectionTitle">Цена (₽)</div>

                <div className="c-priceGrid">

                  <div className="c-inputWrap">
                    <span className="c-inputPrefix">От</span>

                    <input
                      className="c-input"
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) =>
                        setPriceRange([
                          parseInt(e.target.value) || 0,
                          priceRange[1],
                        ])
                      }
                    />
                  </div>

                  <div className="c-inputWrap">
                    <span className="c-inputPrefix">До</span>

                    <input
                      className="c-input"
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([
                          priceRange[0],
                          parseInt(e.target.value) || 500000,
                        ])
                      }
                    />
                  </div>

                </div>

                <div className="c-hint">
                  Дерзко: поставь узкий диапазон — найдёшь самое вкусное.
                </div>

              </div>

            </div>

          </aside>
          <main className="c-main">

            {loading ? (
              <div className="c-state">
                <div className="c-spinner" />
                <p>Загрузка товаров…</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="c-state">
                <p className="c-stateTitle">Ничего не нашли</p>
                <p className="c-stateText">
                  Попробуй другую категорию или расширь диапазон цены.
                </p>
              </div>
            ) : (
              <div className="c-grid">

                {filteredProducts.map((product) => (
                  <div key={product.id} className="c-gridItem">

                    <ProductCard
                      product={product}
                      onAddToCart={handleAddToCart}
                    />

                  </div>
                ))}

              </div>
            )}

          </main>

        </div>

      </div>
    </div>
  );
};
