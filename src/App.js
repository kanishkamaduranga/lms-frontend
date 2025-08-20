import React from 'react'; 
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import CategoryList from './components/categories/CategoryList';
import { UsersPage, UserView } from './components/users';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/categories" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CategoryList />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route path="/admin/users" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <UsersPage />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route path="/admin/users/:userId" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <UserView />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          <Route path="/" element={<Login />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
