// src/services/categoryService.js
import { getApiUrl } from '../utils/api';

export const categoryService = {
  // Get all categories
  getAll: async (token) => {
    const response = await fetch(getApiUrl('/api/categories'), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Get single category
  getById: async (id, token) => {
    const response = await fetch(getApiUrl(`/api/categories/${id}`), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Create category
  create: async (categoryData, token) => {
    const response = await fetch(getApiUrl('/api/categories'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(categoryData),
    });
    return response.json();
  },

  // Update category
  update: async (id, categoryData, token) => {
    const response = await fetch(getApiUrl(`/api/categories/${id}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(categoryData),
    });
    return response.json();
  },

  // Rename category
  rename: async (id, newName, token) => {
    const response = await fetch(getApiUrl(`/api/categories/${id}/rename`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newName }),
    });
    return response.json();
  },

  // Reorder category
  reorder: async (id, position, token) => {
    const response = await fetch(getApiUrl(`/api/categories/${id}/reorder`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ position }),
    });
    return response.json();
  },

  // Delete category
  delete: async (id, token) => {
    const response = await fetch(getApiUrl(`/api/categories/${id}`), {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },
};
