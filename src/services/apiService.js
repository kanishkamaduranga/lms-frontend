
import { getApiUrl, API_CONFIG } from '../utils/api';

export const fetchWithAuth = async (endpoint, token, options = {}) => {
  const response = await fetch(getApiUrl(endpoint), {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
};

export const login = async (credentials) => {
  const response = await fetch(getApiUrl('/api/auth/login'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  return response.json();
};