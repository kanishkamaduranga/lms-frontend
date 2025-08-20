// src/components/categories/CategoryForm.js
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import { categoryService } from '../../services/categoryService';

export default function CategoryForm({ open, onClose, onSave, category, token }) {
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [position, setPosition] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (open) {
      loadCategories();
      if (category) {
        setName(category.name);
        setParentId(category.parent_id || '');
        setPosition(category.position || '');
      } else {
        setName('');
        setParentId('');
        setPosition('');
      }
      setError('');
    }
  }, [open, category]);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll(token);
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const categoryData = {
        name,
        parent_id: parentId ? parseInt(parentId) : null,
        position: position ? parseInt(position) : 0
      };

      if (category) {
        await categoryService.update(category.id, categoryData, token);
      } else {
        await categoryService.create(categoryData, token);
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
        {category ? 'Edit Category' : 'Create Category'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            autoFocus
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <FormControl fullWidth margin="dense">
            <InputLabel>Parent Category</InputLabel>
            <Select
              value={parentId}
              label="Parent Category"
              onChange={(e) => setParentId(e.target.value)}
            >
              <MenuItem value="">None</MenuItem>
              {categories
                .filter(cat => !category || cat.id !== category.id)
                .map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <TextField
            margin="dense"
            label="Position"
            type="number"
            fullWidth
            variant="outlined"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            inputProps={{ min: 0 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
