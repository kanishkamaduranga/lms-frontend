// src/components/users/UserView.js
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
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Business as BusinessIcon,
  Security as SecurityIcon,
  AccessTime as AccessTimeIcon,
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import UserForm from './UserForm';
import { useParams, useNavigate } from 'react-router-dom';

export default function UserView({ userId: propUserId, onBack, onUserUpdate }) {
  const { token } = useAuth();
  const { userId: routeUserId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openEditForm, setOpenEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Use route parameter if available, otherwise use prop
  const userId = routeUserId || propUserId;

  useEffect(() => {
    if (userId && token) {
      loadUserDetails();
    }
  }, [userId, token]);

  const loadUserDetails = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Loading user details for ID:', userId);
      const data = await userService.getById(userId, token);
      console.log('User data received:', data);
      if (data && data.user) {
        setUser(data.user);
      } else {
        setError('User data not found');
      }
    } catch (err) {
      console.error('Error loading user details:', err);
      setError(`Failed to load user details: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setOpenEditForm(true);
  };

  const handleStatusToggle = async () => {
    const newStatus = user.enrollment_status === 'Active' ? 'Suspended' : 'Active';
    const action = newStatus === 'Active' ? 'reactivate' : 'suspend';
    
    if (window.confirm(`Are you sure you want to ${action} this user?`)) {
      try {
        await userService.updateStatus(user.id, newStatus, token);
        loadUserDetails();
        if (onUserUpdate) onUserUpdate();
      } catch (err) {
        setError(`Failed to ${action} user`);
      }
    }
  };

  const handleDelete = async () => {
    try {
      await userService.delete(user.id, token);
      setShowDeleteDialog(false);
      if (onBack) {
        onBack();
      } else {
        navigate('/admin/users');
      }
      if (onUserUpdate) onUserUpdate();
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/admin/users');
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

  if (!userId) {
    return (
      <Alert severity="warning">
        No user ID provided
      </Alert>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
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
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={handleBack} color="primary">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">User Profile</Typography>
        </Box>
        
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEdit}
          >
            Edit User
          </Button>
          
          <Button
            variant="outlined"
            startIcon={user.enrollment_status === 'Active' ? <BlockIcon /> : <CheckCircleIcon />}
            color={user.enrollment_status === 'Active' ? 'warning' : 'success'}
            onClick={handleStatusToggle}
          >
            {user.enrollment_status === 'Active' ? 'Suspend' : 'Reactivate'}
          </Button>
          
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Card */}
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
              
              <Box sx={{ mt: 2, mb: 2 }}>
                {getRoleChip(user.role)}
                <Box sx={{ mt: 1 }}>
                  {getStatusChip(user.enrollment_status)}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon color="action" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Email"
                    secondary={user.email}
                  />
                </ListItem>
                
                {user.department_group && (
                  <ListItem>
                    <ListItemIcon>
                      <BusinessIcon color="action" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Department"
                      secondary={user.department_group}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* User Information */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            {/* Account Information */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
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
                </CardContent>
              </Card>
            </Grid>

            {/* Account Timeline */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
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
                </CardContent>
              </Card>
            </Grid>

            {/* Suspension History */}
            {(user.suspension_date || user.reactivation_date) && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
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
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>

      {/* Edit Form Dialog */}
      <UserForm
        open={openEditForm}
        onClose={() => setOpenEditForm(false)}
        onSave={() => {
          loadUserDetails();
          setOpenEditForm(false);
          if (onUserUpdate) onUserUpdate();
        }}
        user={user}
        token={token}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user "{user.full_name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
