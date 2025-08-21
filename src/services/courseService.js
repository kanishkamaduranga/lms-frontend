// src/services/courseService.js
import { getApiUrl } from '../utils/api';

export const courseService = {
  // Category Management
  // Get all categories
  getAllCategories: async (token) => {
    const response = await fetch(getApiUrl('/api/categories'), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Get single category
  getCategoryById: async (id, token) => {
    const response = await fetch(getApiUrl(`/api/categories/${id}`), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Create category
  createCategory: async (categoryData, token) => {
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
  updateCategory: async (id, categoryData, token) => {
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
  renameCategory: async (id, newName, token) => {
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
  reorderCategory: async (id, position, token) => {
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
  deleteCategory: async (id, token) => {
    const response = await fetch(getApiUrl(`/api/categories/${id}`), {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Course Management
  // Get all courses
  getAllCourses: async (token, page = 1, limit = 10) => {
    const response = await fetch(getApiUrl(`/api/courses?page=${page}&limit=${limit}`), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Get single course with categories & contents
  getCourseById: async (id, token) => {
    const response = await fetch(getApiUrl(`/api/courses/${id}`), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Create course
  createCourse: async (courseData, token) => {
    const response = await fetch(getApiUrl('/api/courses'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(courseData),
    });
    return response.json();
  },

  // Update course
  updateCourse: async (id, courseData, token) => {
    const response = await fetch(getApiUrl(`/api/courses/${id}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(courseData),
    });
    return response.json();
  },

  // Delete course
  deleteCourse: async (id, token) => {
    const response = await fetch(getApiUrl(`/api/courses/${id}`), {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Course Content Management
  // Add content to course
  addCourseContent: async (courseId, contentData, token) => {
    const response = await fetch(getApiUrl(`/api/courses/${courseId}/contents`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(contentData),
    });
    return response.json();
  },

  // Update course content
  updateCourseContent: async (courseId, contentId, contentData, token) => {
    const response = await fetch(getApiUrl(`/api/courses/${courseId}/contents/${contentId}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(contentData),
    });
    return response.json();
  },

  // Delete course content
  deleteCourseContent: async (courseId, contentId, token) => {
    const response = await fetch(getApiUrl(`/api/courses/${courseId}/contents/${contentId}`), {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Reorder course content
  reorderCourseContent: async (courseId, contentId, position, token) => {
    const response = await fetch(getApiUrl(`/api/courses/${courseId}/contents/${contentId}/reorder`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ position }),
    });
    return response.json();
  },
};
