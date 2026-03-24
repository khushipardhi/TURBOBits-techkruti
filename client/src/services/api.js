/**
 * Real API service — connects React frontend to Express backend at :8000
 * All functions read the JWT from localStorage automatically.
 * On 401 → dispatches a custom event → AuthContext logs the user out.
 */
import { API_BASE_URL } from '../utils/constants';

// ==================== HTTP HELPER ====================

function getToken() {
  return localStorage.getItem('foodlink_token');
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...(options.body && { body: options.body }),
  };

  console.log(`📡 API ${config.method} ${endpoint}`);

  try {
    const res = await fetch(url, config);
    const data = await res.json();

    // Handle 401 — token expired or invalid → trigger auto-logout
    if (res.status === 401) {
      console.error('🔒 401 Unauthorized — dispatching session-expired event');
      window.dispatchEvent(new CustomEvent('foodlink:session-expired'));
      throw new Error('Session expired. Please login again.');
    }

    if (!res.ok) {
      console.error(`❌ API ${config.method} ${endpoint} → ${res.status}:`, data.error);
      throw new Error(data.error || data.message || 'Request failed');
    }

    console.log(`✅ API ${config.method} ${endpoint} → ${res.status}`);
    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Cannot connect to server. Is the backend running?');
    }
    throw err;
  }
}

// ==================== AUTH ====================

export async function apiLogin(email, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return { user: data.data.user, token: data.data.token };
}

export async function apiRegister(userData) {
  const data = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  return { user: data.data.user, token: data.data.token };
}

// ==================== FOOD LISTINGS ====================

export async function getAvailableFood() {
  const data = await request('/food/available');
  return data.data;
}

export async function getDonorListings() {
  const data = await request('/food/my-listings');
  return data.data;
}

export async function createFoodListing(foodData) {
  // Wrap multi-item and extra fields in a JSON body for description
  const payloadStr = JSON.stringify({
    items: foodData.items,
    prep_time: foodData.prep_time || null,
    notes: foodData.notes || null
  });

  // Calculate total quantity for backward compatibility
  const totalQuantity = foodData.items.reduce((acc, item) => acc + (parseInt(item.quantity) || 0), 0) || 1;
  const firstUnit = foodData.items[0]?.unit || 'servings';

  const data = await request('/food', {
    method: 'POST',
    body: JSON.stringify({
      food_type: foodData.food_type,
      description: payloadStr.length <= 500 ? payloadStr : foodData.items.map(i => `${i.name}`).join(', ').substring(0, 500),
      quantity: totalQuantity,
      unit: firstUnit,
      hygiene_confirmed: foodData.hygiene_confirmed,
      pickup_address: foodData.pickup_address || null,
    }),
  });
  return data.data;
}

export async function cancelFoodListing(foodId) {
  const data = await request(`/food/${foodId}/cancel`, { method: 'PATCH' });
  return data;
}

// ==================== REQUESTS ====================

export async function claimFood(foodId, modifiedItems = null) {
  const data = await request('/requests/claim', {
    method: 'POST',
    body: JSON.stringify({ food_id: foodId, modified_items: modifiedItems }),
  });
  return data.data;
}

export async function getDonorRequests() {
  const data = await request('/requests/incoming');
  return data.data;
}

export async function getReceiverRequests() {
  const data = await request('/requests/my-requests');
  return data.data;
}

export async function acceptRequest(requestId) {
  const data = await request(`/requests/${requestId}/accept`, { method: 'PATCH' });
  return data;
}

export async function rejectRequest(requestId) {
  const data = await request(`/requests/${requestId}/reject`, { method: 'PATCH' });
  return data;
}

// ==================== VOLUNTEER ====================

export async function getVolunteerTasks() {
  const data = await request('/volunteer/my-tasks');
  return data.data;
}

export async function getAvailableTasks() {
  const data = await request('/volunteer/available-tasks');
  return data.data;
}

export async function acceptTask(requestId) {
  const data = await request('/volunteer/accept-task', {
    method: 'POST',
    body: JSON.stringify({ request_id: requestId }),
  });
  return data.data;
}

export async function confirmPickup(deliveryId) {
  const data = await request(`/volunteer/${deliveryId}/pickup`, { method: 'PATCH' });
  return data;
}

export async function confirmDelivery(deliveryId) {
  const data = await request(`/volunteer/${deliveryId}/deliver`, { method: 'PATCH' });
  return data;
}

// ==================== ADMIN ====================

export async function getAdminStats() {
  const data = await request('/admin/stats');
  return data.data;
}

export async function getAllUsers() {
  const data = await request('/admin/users');
  return data.data;
}

export async function getTrustLogs() {
  const data = await request('/admin/trust-logs');
  return data.data;
}
