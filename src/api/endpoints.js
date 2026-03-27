import axiosInstance from './axiosConfig';
export const authAPI = {
  login: async (email, password) => {
    const response = await axiosInstance.post('/users/login', { email, password });

    const { access_token, role } = response.data;
    if (!access_token) throw new Error('Токен не получен');

    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify({ email, role }));

    return response;
  },

  register: (email, password, full_name, role_id = 0) => {
    return axiosInstance.post('/users/register', {
      email,
      full_name,
      password,
      role_id,
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  me: () => axiosInstance.get('/users/me'),
};
export const productsAPI = {
  getAll: (params = {}) => axiosInstance.get('/products', { params }),
  getById: (id) => axiosInstance.get(`/products/${id}`),
  create: (data) => axiosInstance.post('/products', data),
  update: (id, data) => axiosInstance.put(`/products/${id}`, data),
  delete: (id) => axiosInstance.delete(`/products/${id}`),

  uploadImage: (productId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post(`/products/${productId}/upload_image`, formData);
  },
};
export const categoriesAPI = {
  getAll: () => axiosInstance.get('/categories'),
  getById: (id) => axiosInstance.get(`/categories/${id}`),
  create: (data) => axiosInstance.post('/categories', data),
  update: (id, data) => axiosInstance.put(`/categories/${id}`, data),
  delete: (id) => axiosInstance.delete(`/categories/${id}`),
};
export const ordersAPI = {
  getAll: () => axiosInstance.get('/orders'),
  create: (data) => axiosInstance.post('/orders', data),
  getMyOrders: () => axiosInstance.get('/orders/me'),
  updateStatus: (orderId, status) =>
    axiosInstance.put(`/orders/${orderId}/status`, null, { params: { status } }),
  pay: (orderId) => axiosInstance.post(`/orders/${orderId}/pay`),
  getReceipt: (orderId) => axiosInstance.get(`/orders/${orderId}/receipt`),
};
export const cartAPI = {
  getCart: () => axiosInstance.get('/cart'),
  addToCart: (productId, quantity) =>
    axiosInstance.post('/cart/items', {
      product_id: productId,
      quantity,
    }),
  removeFromCart: (itemId) => axiosInstance.delete(`/cart/items/${itemId}`),
};
export const discountsAPI = {
  getAll: () => axiosInstance.get('/discounts'),
  create: (data) => axiosInstance.post('/discounts', data),
  delete: (id) => axiosInstance.delete(`/discounts/${id}`),
};
export const paymentsAPI = {
  payOrder: (orderId) => axiosInstance.post(`/payments/pay/${orderId}`),
};
export const reportsAPI = {
  getAll: (params = {}) => axiosInstance.get('/reports', { params }),
  create: (params = {}) => axiosInstance.post('/reports', null, { params }),
  getSales: (params = {}) => axiosInstance.get('/reports/sales', { params }),
  getTopProducts: (params = {}) => axiosInstance.get('/reports/top-products', { params }),
  getUserStats: (params = {}) => axiosInstance.get('/reports/user-stats', { params }),
  generateSalesReport: (data = {}) => axiosInstance.post('/admin/reports', data),
};
export const adminAPI = {
  getCategories: () => axiosInstance.get('/admin/categories'),
  createCategory: (data) => axiosInstance.post('/admin/categories', data),

  createProduct: (data) => axiosInstance.post('/admin/products', data),
  updateProduct: (productId, data) => axiosInstance.put(`/admin/products/${productId}`, data),
  deleteProduct: (productId) => axiosInstance.delete(`/admin/products/${productId}`),

  createDiscount: (data) => axiosInstance.post('/admin/discounts', data),

  getOrders: () => axiosInstance.get('/admin/orders'),
  updateOrderStatus: (orderId, status) =>
    axiosInstance.put(`/admin/orders/${orderId}/status`, { status }),

  generateReport: (data = {}) => axiosInstance.post('/admin/reports', data),
};
