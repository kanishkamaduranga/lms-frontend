import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useCallback 
} from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth, login as apiLogin } from '../services/apiService';
import { getApiUrl, API_CONFIG } from '../utils/api';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchMenu = useCallback(async () => {
    try {
      const response = await fetch(getApiUrl(API_CONFIG.endpoints.menu), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setMenuItems(data.menu);
    } catch (err) {
      console.error('Failed to load menu', err);
    }
  }, [token]);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const response = await fetch(getApiUrl(API_CONFIG.endpoints.users.me), {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();
          setUser(data.user);
          await fetchMenu(); // Fetch menu after user data
        } catch (err) {
          console.error('Failed to load user', err);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          navigate('/login');
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token, navigate, fetchMenu]);

  const login = async (identifier, password) => {

    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ identifier, password }),
    });
    const data = await response.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      setToken(data.token);
      await fetchMenu(); 
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setMenuItems([]);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      token, 
      user, 
      menuItems, 
      loading, 
      login, 
      logout 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}