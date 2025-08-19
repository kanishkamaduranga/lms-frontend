
const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 5000,
  endpoints: {
    auth: {
      login: '/api/auth/login',
      register: '/api/auth/register'
    },
    users: {
      me: '/api/users/me',
      all: '/api/users',
      byId: (id) => `/api/users/${id}`
    },
    menu: '/api/menu'
    // Add other endpoints here
  }
};

export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.baseURL}${endpoint}`;
};

export const getAuthEndpoint = (key) => API_CONFIG.endpoints.auth[key];
export const getUsersEndpoint = (key) => API_CONFIG.endpoints.users[key];
export const getMenuEndpoint = () => API_CONFIG.endpoints.menu;

export { API_CONFIG };
//export default API_CONFIG;