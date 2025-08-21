// src/components/users/UserManagement.js
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import UserList from './UserList';
import UserDetails from './UserDetails';
import UserView from './UserView';

export default function UserManagement() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    if (newValue === 0) {
      setSelectedUserId(null);
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUserId(userId);
    setSelectedTab(1);
  };

  const handleCloseDetails = () => {
    setSelectedUserId(null);
    setSelectedTab(0);
  };

  const handleUserView = (userId) => {
    setSelectedUserId(userId);
    setSelectedTab(2);
  };

  const handleBackToList = () => {
    setSelectedUserId(null);
    setSelectedTab(0);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>
      
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs 
          value={selectedTab} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="User List" />
          <Tab label="User Details" disabled={!selectedUserId} />
          <Tab label="User View" disabled={!selectedUserId} />
        </Tabs>
      </Paper>

      {selectedTab === 0 && (
        <UserList onUserSelect={handleUserSelect} onUserView={handleUserView} />
      )}
      
      {selectedTab === 1 && selectedUserId && (
        <UserDetails 
          userId={selectedUserId} 
          onClose={handleCloseDetails}
        />
      )}

      {selectedTab === 2 && selectedUserId && (
        <UserView 
          userId={selectedUserId} 
          onBack={handleBackToList}
          onUserUpdate={() => {
            // Refresh the list when user is updated
            setSelectedTab(0);
            setSelectedUserId(null);
          }}
        />
      )}
    </Box>
  );
}
