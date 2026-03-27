import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { cartAPI, ordersAPI } from '../api/endpoints';

const CartContext = createContext(null);

const normalizeCartItem = (item) => {
  const product = item?.product || item?.product_data || {};

  return {
    ...item,
    product,
    product_id: Number(item?.product_id ?? product?.id ?? 0),
    name: item?.name ?? product?.name ?? 'Без названия',
    price: Number(item?.price ?? product?.price ?? 0),
    image:
      item?.image ??
      item?.image_url ??
      product?.image ??
      product?.image_url ??
      product?.photo ??
      '',
    quantity: Number(item?.quantity ?? 1),
  };
};

const getErrorMessage = (error, fallback = 'Произошла ошибка') => {
  const detail = error?.response?.data?.detail;
  const message = error?.response?.data?.message;

  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map((x) => x?.msg || JSON.stringify(x)).join(', ');
  if (detail && typeof detail === 'object') return JSON.stringify(detail);
  if (typeof message === 'string') return message;
  if (typeof error?.message === 'string') return error.message;

  return fallback;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const getToken = () => localStorage.getItem('token');

  const syncToken = useCallback(() => {
    const newToken = localStorage.getItem('token');
    setToken(newToken);

    if (!newToken) {
      setCart([]);
    }
  }, []);

  const loadCart = useCallback(async () => {
    const currentToken = getToken();

    if (!currentToken) {
      setCart([]);
      return;
    }

    try {
      setLoading(true);

      const response = await cartAPI.getCart();
      const data = response?.data;

      console.log('GET /api/cart response:', data);

      let items = [];

      if (Array.isArray(data)) {
        items = data;
      } else if (Array.isArray(data?.items)) {
        items = data.items;
      } else if (Array.isArray(data?.cart_items)) {
        items = data.cart_items;
      } else {
        console.warn('Неизвестный формат корзины:', data);
        items = [];
      }

      const normalized = items.map(normalizeCartItem);
      console.log('Normalized cart:', normalized);

      setCart(normalized);
    } catch (error) {
      console.error('Ошибка загрузки корзины:', error);
      console.error('Статус GET /api/cart:', error?.response?.status);
      console.error('Ответ GET /api/cart:', error?.response?.data);
      setCart([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    syncToken();

    const handleStorage = () => syncToken();
    const handleFocus = () => syncToken();

    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
    };
  }, [syncToken]);

  useEffect(() => {
    if (!token) {
      setCart([]);
      return;
    }

    loadCart();
  }, [token, loadCart]);

  const addToCart = async (product, quantity = 1) => {
    const currentToken = getToken();

    if (!currentToken) {
      return {
        success: false,
        message: 'Сначала войдите в аккаунт',
      };
    }

    try {
      const payload = {
        product_id: Number(product?.id),
        quantity: Number(quantity),
      };

      if (!payload.product_id || payload.quantity <= 0) {
        return {
          success: false,
          message: 'Некорректные данные товара',
        };
      }

      console.log('POST /api/cart/items payload:', payload);

      const response = await cartAPI.addToCart(payload.product_id, payload.quantity);
      console.log('POST /api/cart/items response:', response?.data);

      await loadCart();

      return {
        success: true,
        message: 'Товар добавлен в корзину',
      };
    } catch (error) {
      console.error('Ошибка добавления товара в корзину:', error);
      console.error('Статус POST /api/cart/items:', error?.response?.status);
      console.error('Ответ POST /api/cart/items:', error?.response?.data);

      return {
        success: false,
        message: getErrorMessage(error, 'Ошибка добавления товара в корзину'),
      };
    }
  };

  const removeFromCart = async (itemId) => {
    const currentToken = getToken();

    if (!currentToken) {
      return {
        success: false,
        message: 'Сначала войдите в аккаунт',
      };
    }

    try {
      await cartAPI.removeFromCart(itemId);
      await loadCart();

      return {
        success: true,
        message: 'Товар удалён из корзины',
      };
    } catch (error) {
      console.error('Ошибка удаления товара:', error);
      console.error('Статус DELETE /api/cart/items:', error?.response?.status);
      console.error('Ответ DELETE /api/cart/items:', error?.response?.data);

      return {
        success: false,
        message: getErrorMessage(error, 'Ошибка удаления товара'),
      };
    }
  };

  const createOrder = async () => {
    const currentToken = getToken();

    if (!currentToken) {
      return {
        success: false,
        message: 'Сначала войдите в аккаунт',
      };
    }

    if (!cart.length) {
      return {
        success: false,
        message: 'Корзина пуста',
      };
    }

    const validItems = cart
      .map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
      }))
      .filter((item) => item.product_id > 0 && item.quantity > 0);

    if (!validItems.length) {
      console.error('Некорректная корзина:', cart);
      return {
        success: false,
        message: 'В корзине некорректные товары',
      };
    }

    const payload = {
      items: validItems,
    };

    console.log('POST /api/orders payload:', JSON.stringify(payload, null, 2));
    console.log('Текущая корзина:', cart);

    try {
      const response = await ordersAPI.create(payload);

      console.log('POST /api/orders response:', response?.data);

      setCart([]);
      await loadCart();

      return {
        success: true,
        message: 'Заказ успешно оформлен',
        order: response?.data,
      };
    } catch (error) {
      console.error('Ошибка при создании заказа:', error);
      console.error('Статус POST /api/orders:', error?.response?.status);
      console.error('Ответ POST /api/orders:', error?.response?.data);
      console.error('Payload POST /api/orders:', payload);

      return {
        success: false,
        message: getErrorMessage(error, 'Ошибка при создании заказа'),
      };
    }
  };

  const clearCartLocal = () => {
    setCart([]);
  };

  const refreshCartAfterLogin = async () => {
    syncToken();
    await loadCart();
  };

  const clearCartAfterLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCart([]);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      return total + Number(item.price || 0) * Number(item.quantity || 0);
    }, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + Number(item.quantity || 0), 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        loadCart,
        addToCart,
        removeFromCart,
        createOrder,
        clearCartLocal,
        refreshCartAfterLogin,
        clearCartAfterLogout,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    return {
      cart: [],
      loading: false,
      loadCart: async () => {},
      addToCart: async () => ({
        success: false,
        message: 'CartProvider не найден',
      }),
      removeFromCart: async () => ({
        success: false,
        message: 'CartProvider не найден',
      }),
      createOrder: async () => ({
        success: false,
        message: 'CartProvider не найден',
      }),
      clearCartLocal: () => {},
      refreshCartAfterLogin: async () => {},
      clearCartAfterLogout: () => {},
      getTotalPrice: () => 0,
      getTotalItems: () => 0,
    };
  }

  return context;
};