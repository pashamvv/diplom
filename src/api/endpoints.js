import axiosInstance from './axiosConfig';

// АУТЕНТИФИКАЦИЯ
export const authAPI = {
  login: (email, password) =>
    axiosInstance.post('/auth/login', { email, password }),
  register: (email, password, name) =>
    axiosInstance.post('/auth/register', { email, password, name }),
  logout: () => axiosInstance.post('/auth/logout'),
  me: () => axiosInstance.get('/auth/me'),
};

// ТОВАРЫ
export const productsAPI = {
  getAll: (params = {}) =>
    axiosInstance.get('/products', { params }),
  getById: (id) =>
    axiosInstance.get(`/products/${id}`),
  create: (data) =>
    axiosInstance.post('/products', data),
  update: (id, data) =>
    axiosInstance.put(`/products/${id}`, data),
  delete: (id) =>
    axiosInstance.delete(`/products/${id}`),
  search: (query) =>
    axiosInstance.get('/products/search', { params: { q: query } }),
};

// КАТЕГОРИИ
export const categoriesAPI = {
  getAll: () =>
    axiosInstance.get('/categories'),
  getById: (id) =>
    axiosInstance.get(`/categories/${id}`),
  create: (data) =>
    axiosInstance.post('/categories', data),
  update: (id, data) =>
    axiosInstance.put(`/categories/${id}`, data),
  delete: (id) =>
    axiosInstance.delete(`/categories/${id}`),
};

// ЗАКАЗЫ
export const ordersAPI = {
  getAll: () =>
    axiosInstance.get('/orders'),
  getById: (id) =>
    axiosInstance.get(`/orders/${id}`),
  create: (data) =>
    axiosInstance.post('/orders', data),
  updateStatus: (id, status) =>
    axiosInstance.patch(`/orders/${id}`, { status }),
};

// КОРЗИНА
export const cartAPI = {
  getCart: () =>
    axiosInstance.get('/cart'),
  addToCart: (productId, quantity) =>
    axiosInstance.post('/cart/items', { productId, quantity }),
  removeFromCart: (itemId) =>
    axiosInstance.delete(`/cart/items/${itemId}`),
  updateQuantity: (itemId, quantity) =>
    axiosInstance.put(`/cart/items/${itemId}`, { quantity }),
  clearCart: () =>
    axiosInstance.delete('/cart'),
};

// СКИДКИ
export const discountsAPI = {
  getAll: () =>
    axiosInstance.get('/discounts'),
  create: (data) =>
    axiosInstance.post('/discounts', data),
  update: (id, data) =>
    axiosInstance.put(`/discounts/${id}`, data),
  delete: (id) =>
    axiosInstance.delete(`/discounts/${id}`),
};

// ОТЧЁТЫ
export const reportsAPI = {
  getSales: (params = {}) =>
    axiosInstance.get('/reports/sales', { params }),
  getTopProducts: () =>
    axiosInstance.get('/reports/top-products'),
  getUserStats: () =>
    axiosInstance.get('/reports/users'),
};
