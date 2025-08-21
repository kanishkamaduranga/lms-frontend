// src/components/users/UsersPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserList from './UserList';

export default function UsersPage() {
  const navigate = useNavigate();

  const handleUserView = (userId) => {
    navigate(`/admin/users/${userId}`);
  };

  return <UserList onUserView={handleUserView} />;
}
