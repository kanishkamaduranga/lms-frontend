// src/components/users/UserDetails.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Divider
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Business as BusinessIcon,
  Security as SecurityIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';

export default function UserDetails({ userId, onClose }) {
  const { token } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userId) {
      loadUserDetails();
    }
  }, [userId]);

  const loadUserDetails = async () => {
    try {
      setLoading(true);
      const data = await userService.getById(userId, token);
      setUser(data.user);
    } catch (err) {
      setError('Failed to load user details');
      console.error('Error loading user details:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleString();
  };

  const getStatusChip = (status) => {
    return status === 'Active' ? (
      <Chip label="Active" color="success" size="small" />
    ) : (
      <Chip label="Suspended" color="error" size="small" />
    );
  };

  const getRoleChip = (role) => {
    const colors = {
      'Admin': 'error',
      'Instructor': 'warning',
      'Student': 'primary',
      'Guest': 'default'
    };
    return (
      <Chip 
        label={role} 
        color={colors[role] || 'default'} 
        size="small" 
        variant="outlined"
      />
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!user) {
    return (
      <Alert severity="warning">
        User not found
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">User Details</Typography>
        {onClose && (
          <Button onClick={onClose} variant="outlined">
            Close
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* User Profile Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mx: 'auto', 
                  mb: 2,
                  fontSize: '3rem'
                }}
              >
                {user.profile_picture ? (
                  <img src={user.profile_picture} alt={user.full_name} />
                ) : (
                  <PersonIcon sx={{ fontSize: '3rem' }} />
                )}
              </Avatar>
              
              <Typography variant="h5" gutterBottom>
                {user.full_name}
              </Typography>
              
              <Typography variant="body2" color="textSecondary" gutterBottom>
                @{user.username}
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                {getRoleChip(user.role)}
                <Box sx={{ mt: 1 }}>
                  {getStatusChip(user.enrollment_status)}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* User Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <EmailIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Email Address
                      </Typography>
                      <Typography variant="body2">
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <BusinessIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Department Group
                      </Typography>
                      <Typography variant="body2">
                        {user.department_group || 'Not assigned'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Account Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <SecurityIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Role
                      </Typography>
                      <Typography variant="body2">
                        {user.role}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <AccessTimeIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Last Login
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(user.last_login_date)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Account Timeline
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <CalendarIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Created Date
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(user.created_at)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <CalendarIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Last Updated
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(user.updated_at)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              {/* Suspension Information */}
              {(user.suspension_date || user.reactivation_date) && (
                <>
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="h6" gutterBottom>
                    Suspension History
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {user.suspension_date && (
                      <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                          <CalendarIcon color="error" />
                          <Box>
                            <Typography variant="caption" color="textSecondary">
                              Suspended Date
                            </Typography>
                            <Typography variant="body2">
                              {formatDate(user.suspension_date)}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    )}
                    
                    {user.reactivation_date && (
                      <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                          <CalendarIcon color="success" />
                          <Box>
                            <Typography variant="caption" color="textSecondary">
                              Reactivated Date
                            </Typography>
                            <Typography variant="body2">
                              {formatDate(user.reactivation_date)}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
