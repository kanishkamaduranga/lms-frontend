// src/components/users/UserList.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  Tooltip,
  TablePagination
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import UserForm from './UserForm';

export default function UserList({ onUserSelect, onUserView }) {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [paginationInfo, setPaginationInfo] = useState({});

  useEffect(() => {
    loadUsers();
  }, [page, rowsPerPage]); // Reload when page or rowsPerPage changes

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll(token, page + 1, rowsPerPage);
      setUsers(data.users || []);
      setTotalUsers(data.pagination?.totalItems || 0);
      setPaginationInfo(data.pagination || {});
    } catch (err) {
      setError('Failed to load users');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when changing rows per page
  };

  const handleCreate = () => {
    setEditingUser(null);
    setOpenForm(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setOpenForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await userService.delete(id, token);
        loadUsers();
      } catch (err) {
        setError('Failed to delete user');
      }
    }
  };

  const handleStatusToggle = async (user) => {
    const newStatus = user.enrollment_status === 'Active' ? 'Suspended' : 'Active';
    const action = newStatus === 'Active' ? 'reactivate' : 'suspend';
    
    if (window.confirm(`Are you sure you want to ${action} this user?`)) {
      try {
        await userService.updateStatus(user.id, newStatus, token);
        loadUsers();
      } catch (err) {
        setError(`Failed to ${action} user`);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
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

  if (loading && users.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">User Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Add User
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 200 }}>User</TableCell>
              <TableCell sx={{ minWidth: 200 }}>Email</TableCell>
              <TableCell sx={{ minWidth: 120 }}>Role</TableCell>
              <TableCell sx={{ minWidth: 100 }}>Status</TableCell>
              <TableCell sx={{ minWidth: 150 }}>Department</TableCell>
              <TableCell sx={{ minWidth: 120 }}>Last Login</TableCell>
              <TableCell sx={{ minWidth: 120 }}>Created</TableCell>
              <TableCell sx={{ minWidth: 150 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>
                  <Box 
                    display="flex" 
                    alignItems="center" 
                    gap={1}
                    sx={{ cursor: 'pointer', minWidth: 180 }}
                    onClick={() => onUserSelect && onUserSelect(user.id)}
                  >
                    <Avatar sx={{ width: 32, height: 32, flexShrink: 0 }}>
                      {user.profile_picture ? (
                        <img src={user.profile_picture} alt={user.full_name} />
                      ) : (
                        <PersonIcon />
                      )}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="body2" fontWeight="medium" noWrap>
                        {user.full_name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" noWrap>
                        @{user.username}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap>
                    {user.email}
                  </Typography>
                </TableCell>
                <TableCell>{getRoleChip(user.role)}</TableCell>
                <TableCell>{getStatusChip(user.enrollment_status)}</TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap>
                    {user.department_group || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap>
                    {formatDate(user.last_login_date)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap>
                    {formatDate(user.created_at)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={0.5} flexWrap="nowrap">
                    <Tooltip title="View User">
                      <IconButton
                        size="small"
                        onClick={() => onUserView && onUserView(user.id)}
                        color="info"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Edit User">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(user)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title={user.enrollment_status === 'Active' ? "Suspend User" : "Reactivate User"}>
                      <IconButton
                        size="small"
                        onClick={() => handleStatusToggle(user)}
                        color={user.enrollment_status === 'Active' ? "warning" : "success"}
                      >
                        {user.enrollment_status === 'Active' ? <BlockIcon /> : <CheckCircleIcon />}
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Delete User">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(user.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {/* Pagination component */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalUsers}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <UserForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSave={loadUsers}
        user={editingUser}
        token={token}
      />
    </Box>
  );
}