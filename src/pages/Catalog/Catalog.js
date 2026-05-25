import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { useCart } from '../../hooks/useCart';
import { productsAPI, categoriesAPI, discountsAPI } from '../../api/endpoints';
import {
  getProductPricing,
  hasEmbeddedDiscountData,
  isDiscountActive,
} from '../../utils/pricing';
import './Catalog.css';

export const Catalog = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || 'all'
  );
  const [priceRange, setPriceRange] = useState([0, 500000]);

  const { addToCart } = useCart();

  const searchQuery = searchParams.get('search') || '';
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const normalizedSelectedCategory = String(selectedCategory).toLowerCase();

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const productsResponse = await productsAPI.getAll();
      const productsData = Array.isArray(productsResponse?.data)
        ? productsResponse.data
        : productsResponse?.data?.items || [];

      let discountsData = [];

      const productsContainDiscounts = productsData.some(hasEmbeddedDiscountData);

      if (!productsContainDiscounts) {
        try {
          const discountsResponse = await discountsAPI.getAll({ publicOnly: true });
          discountsData = Array.isArray(discountsResponse?.data)
            ? discountsResponse.data
            : discountsResponse?.data?.items || [];
        } catch (discountError) {
          console.warn(
            'Discounts are unavailable, catalog will be shown without separate discounts:',
            discountError
          );
        }
      }

      setProducts(productsData);
      setDiscounts(discountsData.filter(isDiscountActive));
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
      setDiscounts([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
  }, [loadProducts]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const productsWithPricing = useMemo(() => {
    return products.map((product) => {
      const productDiscounts = discounts.filter(
        (discount) => Number(discount?.product_id) === Number(product?.id)
      );
      const embeddedDiscounts = Array.isArray(product?.discounts)
        ? product.discounts
        : [
            product?.discount_data,
            product?.discount_info,
            product?.active_discount,
          ].filter(Boolean);
      const mergedDiscounts = [...embeddedDiscounts, ...productDiscounts];
      const pricing = getProductPricing(product, mergedDiscounts);

      return {
        ...product,
        discounts: mergedDiscounts,
        discount_percent: pricing.discountPercent,
        final_price: pricing.finalPrice,
        original_price: pricing.basePrice,
      };
    });
  }, [discounts, products]);

  const filteredProducts = useMemo(() => {
    return productsWithPricing.filter((product) => {
      const categoryIdText = String(
        product?.category_id ?? product?.category?.id ?? ''
      ).toLowerCase();
      const categoryNameText = String(
        product?.category?.name ?? product?.category ?? ''
      ).toLowerCase();
      const idText = String(product?.id ?? '');
      const nameText = String(product?.name ?? '').toLowerCase();
      const descriptionText = String(product?.description ?? '').toLowerCase();
      const productPrice = Number(product?.final_price ?? product?.price ?? 0);

      const matchesCategory =
        normalizedSelectedCategory === 'all' ||
        categoryIdText === normalizedSelectedCategory ||
        categoryNameText === normalizedSelectedCategory;

      const matchesPrice =
        productPrice >= Number(priceRange[0] ?? 0) &&
        productPrice <= Number(priceRange[1] ?? Number.MAX_SAFE_INTEGER);

      const matchesSearch =
        !normalizedSearchQuery ||
        idText.includes(normalizedSearchQuery) ||
        nameText.includes(normalizedSearchQuery) ||
        descriptionText.includes(normalizedSearchQuery) ||
        categoryIdText.includes(normalizedSearchQuery) ||
        categoryNameText.includes(normalizedSearchQuery);

      return matchesCategory && matchesPrice && matchesSearch;
    });
  }, [normalizedSearchQuery, normalizedSelectedCategory, priceRange, productsWithPricing]);


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
              <span className="c-pillCount">{loading ? '…' : filteredProducts.length}</span>
              <span className="c-pillLabel">товаров</span>
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
                      min="0"
                      value={priceRange[0]}
                      onChange={(e) =>
                        setPriceRange([
                          Math.min(parseInt(e.target.value, 10) || 0, priceRange[1]),
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
                      min={priceRange[0]}
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([
                          priceRange[0],
                          Math.max(parseInt(e.target.value, 10) || priceRange[0], priceRange[0]),
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
