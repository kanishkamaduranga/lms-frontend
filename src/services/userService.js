// src/services/userService.js
import { getApiUrl } from '../utils/api';

export const userService = {
  // Get all users
  getAll: async (token) => {
    const response = await fetch(getApiUrl('/api/users'), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Get single user by ID
  getById: async (id, token) => {
    const response = await fetch(getApiUrl(`/api/users/${id}`), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Create new user
  create: async (userData, token) => {
    const response = await fetch(getApiUrl('/api/users'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  // Update user
  update: async (id, userData, token) => {
    const response = await fetch(getApiUrl(`/api/users/${id}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  // Suspend/Reactivate user
  updateStatus: async (id, enrollmentStatus, token) => {
    const response = await fetch(getApiUrl(`/api/users/${id}/suspend`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ enrollment_status: enrollmentStatus }),
    });
    return response.json();
  },

  // Delete user
  delete: async (id, token) => {
    const response = await fetch(getApiUrl(`/api/users/${id}`), {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },
};
