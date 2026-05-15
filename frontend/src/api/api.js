import axios from 'axios';

const API_BASE = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tonggo_token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('tonggo_token');
      localStorage.removeItem('tonggo_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ===== AUTH =====
export const authAPI = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
};

// ===== PRODUCTS =====
export const productAPI = {
  getAll: () => api.get('/api/products/display'),
  create: (data) => api.post('/api/products/tambah', data),
  update: (id, data) => api.put(`/api/products/ubah/${id}`, data),
  delete: (id) => api.delete(`/api/products/hapus/${id}`),
};

// ===== KERANJANG (CART) =====
export const cartAPI = {
  getAll: () => api.get('/api/keranjang/display'),
  add: (data) => api.post('/api/keranjang/tambah', data),
  remove: (id) => api.delete(`/api/keranjang/hapus/${id}`),
};

// ===== ORDERS =====
export const tableAPI = {
  getAll: () => api.get('/api/tables'),
  create: (data) => api.post('/api/tables', data),
  update: (id, data) => api.put(`/api/tables/${id}`, data),
  delete: (id) => api.delete(`/api/tables/${id}`),
};

export const orderAPI = {
  create: (userId, tableId) => api.post(`/api/orders/init?userId=${userId}&tableId=${tableId}`),
  getAll: () => api.get('/api/orders/list'),
  getById: (id) => api.get(`/api/orders/${id}`),
  getByUser: (userId) => api.get(`/api/orders/user/${userId}`),
  getItems: (id) => api.get(`/api/orders/${id}/items`),
  delete: (id) => api.delete(`/api/orders/${id}`),
  getReceipt: (id) => `${API_BASE}/api/orders/${id}/receipt`,
};

// ===== PAYMENT =====
export const paymentAPI = {
  process: (data) => api.post('/api/payment/process', data),
  getStatus: (orderId) => api.get(`/api/payment/${orderId}`),
};

// ===== DETECTION =====
export const detectionAPI = {
  start: () => api.post('/api/detection/start'),
  getLatestScan: () => `${API_BASE}/api/detection/latest-scan`,
  getLatestPdf: () => `${API_BASE}/api/detection/latest-pdf`,
};

export default api;
