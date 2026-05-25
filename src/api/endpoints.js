import axiosInstance from './axiosConfig';

const tryRequestVariants = async (variants, retryStatuses = [404, 405]) => {
  let lastError = null;

  for (const runRequest of variants) {
    try {
      return await runRequest();
    } catch (error) {
      lastError = error;
      const status = error?.response?.status;

      if (!retryStatuses.includes(status)) {
        throw error;
      }
    }
  }

  throw lastError;
};

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

export const usersAPI = {
  getAll: () =>
    tryRequestVariants([
      () => axiosInstance.get('/admin/users'),
      () => axiosInstance.get('/users'),
      () => axiosInstance.get('/users/all'),
      () => axiosInstance.get('/auth/users'),
    ]),

  updateRole: async (target, role) => {
    const userId = Number(target?.id ?? target?.user_id ?? target);
    const email = typeof target === 'object' ? target?.email : '';
    const payload = {
      role,
      user_role: role,
      role_id: role === 'admin' ? 1 : 0,
      is_admin: role === 'admin',
      email,
      user_id: Number.isFinite(userId) && userId > 0 ? userId : undefined,
    };

    const variants = [];

    if (Number.isFinite(userId) && userId > 0) {
      variants.push(
        () => axiosInstance.put(`/admin/users/${userId}/role`, payload),
        () => axiosInstance.patch(`/admin/users/${userId}/role`, payload),
        () => axiosInstance.put(`/users/${userId}/role`, payload),
        () => axiosInstance.patch(`/users/${userId}/role`, payload)
      );
    }

    variants.push(
      () => axiosInstance.post('/admin/users/role', payload),
      () => axiosInstance.post('/users/role', payload),
      () => axiosInstance.post('/admin/users/set-role', payload),
      () => axiosInstance.post('/users/set-role', payload)
    );

    return tryRequestVariants(variants);
  },

  getProfile: () => axiosInstance.get('/users/me'),
  updateProfile: (data) =>
    tryRequestVariants([
      () => axiosInstance.patch('/users/me', data),
      () => axiosInstance.put('/users/me', data),
    ]),
  getAddresses: () => axiosInstance.get('/users/me/addresses'),
  createAddress: (data) => axiosInstance.post('/users/me/addresses', data),
  updateAddress: (addressId, data) =>
    tryRequestVariants([
      () => axiosInstance.patch(`/users/me/addresses/${addressId}`, data),
      () => axiosInstance.put(`/users/me/addresses/${addressId}`, data),
    ]),
  deleteAddress: (addressId) => axiosInstance.delete(`/users/me/addresses/${addressId}`),
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
  cancelMyOrder: (orderId) =>
    tryRequestVariants(
      [
        () => axiosInstance.post(`/orders/${orderId}/cancel`),
        () => axiosInstance.patch(`/orders/${orderId}/cancel`),
        () => axiosInstance.put(`/orders/${orderId}/cancel`),
        () => axiosInstance.patch(`/orders/${orderId}`, { status: 'cancelled' }),
        () => axiosInstance.put(`/orders/${orderId}`, { status: 'cancelled' }),
        () =>
          axiosInstance.put(`/orders/${orderId}/status`, null, {
            params: { status: 'cancelled' },
          }),
        () =>
          axiosInstance.patch(`/orders/${orderId}/status`, {
            status: 'cancelled',
          }),
      ],
      [403, 404, 405]
    ),
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
  getAll: async (options = {}) => {
    const { publicOnly = false } = options;

    if (publicOnly) {
      return axiosInstance.get('/discounts', { skipAuth: true });
    }

    try {
      return await axiosInstance.get('/discounts');
    } catch (error) {
      const status = error?.response?.status;

      if (![401, 403].includes(status)) {
        throw error;
      }

      return axiosInstance.get('/discounts', { skipAuth: true });
    }
  },
  create: (data) => axiosInstance.post('/discounts', data),
  update: async (id, data) => {
    try {
      return await tryRequestVariants([
        () => axiosInstance.put(`/discounts/${id}`, data),
        () => axiosInstance.patch(`/discounts/${id}`, data),
      ]);
    } catch (error) {
      const status = error?.response?.status;

      if (![404, 405].includes(status)) {
        throw error;
      }

      await discountsAPI.delete(id);
      return discountsAPI.create(data);
    }
  },
  delete: (id) => axiosInstance.delete(`/discounts/${id}`),
};

export const reviewsAPI = {
  getByProduct: (productId) => axiosInstance.get(`/products/${productId}/reviews`),
  create: (productId, data) => axiosInstance.post(`/products/${productId}/reviews`, data),
  update: (reviewId, data, method = 'patch') =>
    method === 'put'
      ? axiosInstance.put(`/reviews/${reviewId}`, data)
      : axiosInstance.patch(`/reviews/${reviewId}`, data),
  delete: (reviewId) => axiosInstance.delete(`/reviews/${reviewId}`),
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
