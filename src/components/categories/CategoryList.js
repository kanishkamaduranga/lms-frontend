// src/components/categories/CategoryList.js
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Reorder as ReorderIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { categoryService } from '../../services/categoryService';
import CategoryForm from './CategoryForm';

export default function CategoryList() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [reorderDialog, setReorderDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newPosition, setNewPosition] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAll(token);
      setCategories(data.categories || []);
    } catch (err) {
      setError('Failed to load categories');
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setOpenForm(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setOpenForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryService.delete(id, token);
        loadCategories();
      } catch (err) {
        setError('Failed to delete category');
      }
    }
  };

  const handleReorder = (category) => {
    setSelectedCategory(category);
    setNewPosition(category.position || '');
    setReorderDialog(true);
  };

  const handleSaveReorder = async () => {
    try {
      await categoryService.reorder(selectedCategory.id, parseInt(newPosition), token);
      setReorderDialog(false);
      loadCategories();
    } catch (err) {
      setError('Failed to reorder category');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Categories</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Add Category
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Parent ID</TableCell>
              <TableCell>Position</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.parent_id || 'None'}</TableCell>
                <TableCell>{category.position}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(category)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleReorder(category)}
                    color="secondary"
                  >
                    <ReorderIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(category.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <CategoryForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSave={loadCategories}
        category={editingCategory}
        token={token}
      />

      <Dialog open={reorderDialog} onClose={() => setReorderDialog(false)}>
        <DialogTitle>Reorder Category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Position"
            type="number"
            fullWidth
            variant="outlined"
            value={newPosition}
            onChange={(e) => setNewPosition(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReorderDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveReorder}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
