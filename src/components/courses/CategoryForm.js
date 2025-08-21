// src/components/courses/CategoryForm.js
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { courseService } from '../../services/courseService';

export default function CategoryForm({ open, onClose, onSave, category, token }) {
  const [formData, setFormData] = useState({
    name: '',
    parent_id: '',
    position: 0
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      loadCategories();
    }
  }, [open]);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        parent_id: category.parent_id || '',
        position: category.position || 0
      });
    } else {
      setFormData({
        name: '',
        parent_id: '',
        position: 0
      });
    }
  }, [category]);

  const loadCategories = async () => {
    try {
      const data = await courseService.getAllCategories(token);
      // Filter out the current category if editing to prevent self-reference
      const filteredCategories = category 
        ? data.categories.filter(cat => cat.id !== category.id)
        : data.categories;
      setCategories(filteredCategories);
    } catch (err) {
      setError('Failed to load categories');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (category) {
        // Update existing category
        await courseService.updateCategory(category.id, formData, token);
      } else {
        // Create new category
        await courseService.createCategory(formData, token);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {category ? 'Edit Category' : 'Add New Category'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              name="name"
              label="Category Name"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
              placeholder="e.g., Grade 6, Science, Mathematics"
            />
            
            <FormControl fullWidth>
              <InputLabel>Parent Category</InputLabel>
              <Select
                name="parent_id"
                value={formData.parent_id}
                onChange={handleChange}
                label="Parent Category"
              >
                <MenuItem value="">
                  <em>No Parent (Top Level)</em>
                </MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              name="position"
              label="Position"
              type="number"
              value={formData.position}
              onChange={handleChange}
              fullWidth
              inputProps={{ min: 0 }}
              helperText="Order in which this category appears (0 = first)"
            />
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Saving...' : (category ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
