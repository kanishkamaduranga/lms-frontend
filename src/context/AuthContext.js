import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          // Fetch user data using the token
          const response = await fetch('http://localhost:5000/api/users/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();
          setUser(data.user);
        } catch (err) {
          console.error('Failed to load user', err);
          // Inline logout functionality instead of calling the function
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          navigate('/login');
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token, navigate]); // Only include token and navigate in dependencies

  const login = async (identifier, password) => {
    const response = await fetch('http://localhost:5000/api/auth/login', {
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
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}