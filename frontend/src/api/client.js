import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to unwrap { success, data, message } envelope
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    console.error('[API Error]', message);
    return Promise.reject(error);
  }
);

// ============ Dashboard ============
export const fetchDashboardSummary = () => api.get('/dashboard/summary');
export const fetchDashboardProduction = () => api.get('/dashboard/production');

// ============ Purchase Orders ============
export const fetchPurchaseOrders = () => api.get('/purchase-orders');
export const fetchPurchaseOrder = (id) => api.get(`/purchase-orders/${id}`);
export const createPurchaseOrder = (data) => api.post('/purchase-orders', data);
export const validatePurchaseOrder = (id) => api.post(`/purchase-orders/${id}/validate`);
export const processPurchaseOrder = (id) => api.post(`/purchase-orders/${id}/process`);
export const fetchPOTimeline = (id) => api.get(`/purchase-orders/${id}/timeline`);

// ============ Inventory ============
export const fetchInventory = () => api.get('/inventory');
export const fetchInventoryByMaterial = (materialId) => api.get(`/inventory/material/${materialId}`);
export const checkInventory = (purchaseOrderId) => api.post('/inventory/check', { purchaseOrderId });

// ============ Production Plans ============
export const fetchProductionPlans = () => api.get('/production-plans');
export const generateProductionPlan = (data) => api.post('/production-plans/generate', data);

// ============ Purchase Requests ============
export const fetchPurchaseRequests = () => api.get('/purchase-requests');
export const createPurchaseRequest = (data) => api.post('/purchase-requests', data);

// ============ Approvals ============
export const fetchApprovals = () => api.get('/approvals');
export const approveRequest = (id) => api.patch(`/approvals/${id}/approve`);
export const rejectRequest = (id) => api.patch(`/approvals/${id}/reject`);

// ============ Master Data ============
export const fetchCustomers = () => api.get('/customers');
export const fetchProducts = () => api.get('/products');
export const fetchMaterials = () => api.get('/materials');
export const fetchSuppliers = () => api.get('/suppliers');

// ============ Health ============
export const fetchHealth = () => api.get('/health');

export default api;
