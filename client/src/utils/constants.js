// API Base URL (Dynamic for Vercel vs Local)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// User Roles
export const ROLES = {
  DONOR: 'DONOR',
  RECEIVER: 'RECEIVER',
  VOLUNTEER: 'VOLUNTEER',
  ADMIN: 'ADMIN',
};

// Food Listing Statuses
export const FOOD_STATUSES = {
  AVAILABLE: 'AVAILABLE',
  REQUESTED: 'REQUESTED',
  ACCEPTED: 'ACCEPTED',
  FULFILLED: 'FULFILLED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
};

// Request Statuses
export const REQUEST_STATUSES = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  FULFILLED: 'FULFILLED',
  CANCELLED: 'CANCELLED',
};

// Delivery Statuses
export const DELIVERY_STATUSES = {
  ASSIGNED: 'ASSIGNED',
  PICKED_UP: 'PICKED_UP',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
};

// Food Types
export const FOOD_TYPES = {
  VEG: 'VEG',
  NON_VEG: 'NON_VEG',
  MIXED: 'MIXED',
};

// Helper to get stored token
export function getToken() {
  return localStorage.getItem('foodlink_token');
}
