// src/components/courses/CategoryList.js
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
  TextField,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Reorder as ReorderIcon,
  Add as AddIcon,
  Folder as FolderIcon,
  SubdirectoryArrowRight as SubdirectoryIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { courseService } from '../../services/courseService';
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
      const data = await courseService.getAllCategories(token);
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
    if (window.confirm('Are you sure you want to delete this category? This will also delete all subcategories.')) {
      try {
        await courseService.deleteCategory(id, token);
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
      await courseService.reorderCategory(selectedCategory.id, parseInt(newPosition), token);
      setReorderDialog(false);
      loadCategories();
    } catch (err) {
      setError('Failed to reorder category');
    }
  };

  const getCategoryPath = (category) => {
    if (!category.parent_id) {
      return category.name;
    }
    
    const parent = categories.find(cat => cat.id === category.parent_id);
    if (parent) {
      return `${parent.name} > ${category.name}`;
    }
    
    return category.name;
  };

  const getChildCategories = (parentId) => {
    return categories.filter(cat => cat.parent_id === parentId);
  };

  const renderCategoryRow = (category, level = 0) => {
    const children = getChildCategories(category.id);
    
    return (
      <React.Fragment key={category.id}>
        <TableRow hover>
          <TableCell>
            <Box display="flex" alignItems="center" gap={1}>
              {level > 0 && (
                <Box display="flex" alignItems="center" sx={{ width: level * 20 }}>
                  <SubdirectoryIcon fontSize="small" color="action" />
                </Box>
              )}
              <FolderIcon color="primary" />
              <Typography variant="body2">
                {category.name}
              </Typography>
              {children.length > 0 && (
                <Chip 
                  label={`${children.length} subcategories`} 
                  size="small" 
                  variant="outlined" 
                  color="primary"
                />
              )}
            </Box>
          </TableCell>
          <TableCell>
            <Typography variant="body2" color="textSecondary">
              {getCategoryPath(category)}
            </Typography>
          </TableCell>
          <TableCell>{category.position}</TableCell>
          <TableCell>
            <Box display="flex" gap={0.5}>
              <Tooltip title="Edit Category">
                <IconButton
                  size="small"
                  onClick={() => handleEdit(category)}
                  color="primary"
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Reorder Category">
                <IconButton
                  size="small"
                  onClick={() => handleReorder(category)}
                  color="secondary"
                >
                  <ReorderIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Delete Category">
                <IconButton
                  size="small"
                  onClick={() => handleDelete(category.id)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </TableCell>
        </TableRow>
        
        {/* Render child categories */}
        {children.map(child => renderCategoryRow(child, level + 1))}
      </React.Fragment>
    );
  };

  const topLevelCategories = categories.filter(cat => !cat.parent_id);

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
        <Typography variant="h4">Course Categories</Typography>
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
              <TableCell>Category Name</TableCell>
              <TableCell>Full Path</TableCell>
              <TableCell>Position</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {topLevelCategories.map(category => renderCategoryRow(category))}
            {topLevelCategories.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body2" color="textSecondary">
                    No categories found. Create your first category to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
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
            inputProps={{ min: 0 }}
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
