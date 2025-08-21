// src/components/courses/CourseForm.js
import React, { useState, useEffect, useCallback } from 'react';
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
  CircularProgress,
  Chip,
  Autocomplete,
  FormHelperText,
  Typography
} from '@mui/material';
import { courseService } from '../../services/courseService';
import { userService } from '../../services/userService';

export default function CourseForm({ open, onClose, onSave, course, token }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_minutes: 30,
    start_date: '',
    end_date: '',
    tags: [],
    instructor_id: '',
    category_ids: []
  });
  const [categories, setCategories] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const extractIds = useCallback((input) => {
    if (!Array.isArray(input)) return [];
    return input.map((item) => {
      const idCandidate = (item && typeof item === 'object') ? item.id : item;
      const asNumber = Number(idCandidate);
      return Number.isNaN(asNumber) ? idCandidate : asNumber;
    });
  }, []);

  const loadCourseDetails = useCallback(async (id) => {
    try {
      const data = await courseService.getCourseById(id, token);
      const apiCourse = data.course || {};
      const apiCategories = data.categories || [];

      const normalizedCategoryIds = extractIds(apiCategories);
      const normalizedInstructorId = (() => {
        const candidate = apiCourse.instructor_id ?? (apiCourse.instructor && apiCourse.instructor.id);
        const asNumber = Number(candidate);
        return Number.isNaN(asNumber) ? (candidate || '') : asNumber;
      })();

      setFormData({
        name: apiCourse.name || '',
        description: apiCourse.description || '',
        duration_minutes: apiCourse.duration_minutes || 30,
        start_date: apiCourse.start_date ? apiCourse.start_date.split('T')[0] : '',
        end_date: apiCourse.end_date ? apiCourse.end_date.split('T')[0] : '',
        tags: Array.isArray(apiCourse.tags) ? apiCourse.tags : [],
        instructor_id: normalizedInstructorId,
        category_ids: normalizedCategoryIds
      });
    } catch (err) {
      // Fallback: keep existing form data if detail fetch fails
    }
  }, [extractIds, token]);

  useEffect(() => {
    if (open) {
      loadCategories();
      loadInstructors();
    }
  }, [open]);

  useEffect(() => {
    if (course && course.id) {
      // When an id is present, fetch authoritative details to include categories array
      loadCourseDetails(course.id);
    } else if (course) {
      const extractIds = (input) => {
        if (!Array.isArray(input)) return [];
        return input.map((item) => {
          const idCandidate = (item && typeof item === 'object') ? item.id : item;
          const asNumber = Number(idCandidate);
          return Number.isNaN(asNumber) ? idCandidate : asNumber;
        });
      };

      const derivedCategoryIds = Array.isArray(course.category_ids)
        ? course.category_ids
        : Array.isArray(course.categories)
          ? extractIds(course.categories)
          : [];

      const normalizedCategoryIds = extractIds(derivedCategoryIds);

      const normalizedInstructorId = (() => {
        const candidate = course.instructor_id ?? (course.instructor && course.instructor.id);
        const asNumber = Number(candidate);
        return Number.isNaN(asNumber) ? (candidate || '') : asNumber;
      })();

      setFormData({
        name: course.name || '',
        description: course.description || '',
        duration_minutes: course.duration_minutes || 30,
        start_date: course.start_date ? course.start_date.split('T')[0] : '',
        end_date: course.end_date ? course.end_date.split('T')[0] : '',
        tags: Array.isArray(course.tags) ? course.tags : [],
        instructor_id: normalizedInstructorId,
        category_ids: normalizedCategoryIds
      });
    } else {
      setFormData({
        name: '',
        description: '',
        duration_minutes: 30,
        start_date: '',
        end_date: '',
        tags: [],
        instructor_id: '',
        category_ids: []
      });
    }
  }, [course, loadCourseDetails]);

  const loadCategories = useCallback(async () => {
    try {
      const data = await courseService.getAllCategories(token);
      setCategories(data.categories || []);
    } catch (err) {
      setError('Failed to load categories');
    }
  }, [token]);

  const loadInstructors = useCallback(async () => {
    try {
      const data = await userService.getByRole('Instructor', token);
      setInstructors(data.users || []);
    } catch (err) {
      setError('Failed to load instructors');
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagsChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      tags: Array.isArray(newValue) ? newValue : []
    }));
  };

  const handleCategoriesChange = (event) => {
    const { value } = event.target;
    const next = Array.isArray(value) ? value : [];
    const normalized = next.map((v) => {
      const num = Number(v);
      return Number.isNaN(num) ? v : num;
    });
    setFormData(prev => ({
      ...prev,
      category_ids: normalized
    }));
    setCategoriesOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate dates
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      if (startDate >= endDate) {
        setError('End date must be after start date');
        setLoading(false);
        return;
      }
    }

    try {
      if (course) {
        // Update existing course
        await courseService.updateCourse(course.id, formData, token);
      } else {
        // Create new course
        await courseService.createCourse(formData, token);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) return false;
    if (!formData.description.trim()) return false;
    if (formData.duration_minutes <= 0) return false;
    if (!formData.start_date) return false;
    if (!formData.end_date) return false;
    if (formData.category_ids.length === 0) return false;
    return true;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {course ? 'Edit Course' : 'Add New Course'}
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
              label="Course Name"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
              placeholder="e.g., Introduction to React Development"
            />
            
            <TextField
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleChange}
              required
              fullWidth
              multiline
              rows={3}
              placeholder="Provide a detailed description of the course content and objectives"
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                name="duration_minutes"
                label="Duration (minutes)"
                type="number"
                value={formData.duration_minutes}
                onChange={handleChange}
                required
                fullWidth
                inputProps={{ min: 1 }}
                helperText="Estimated time to complete the course"
              />
              
                             <FormControl fullWidth>
                 <InputLabel>Instructor</InputLabel>
                 <Select
                   name="instructor_id"
                   value={formData.instructor_id}
                   onChange={handleChange}
                   label="Instructor"
                 >
                   <MenuItem value="">
                     <em>Select an instructor</em>
                   </MenuItem>
                   {instructors.map((instructor) => (
                     <MenuItem key={instructor.id} value={instructor.id}>
                       {instructor.full_name}
                     </MenuItem>
                   ))}
                 </Select>
                 <FormHelperText>
                   Select an instructor to assign to this course
                 </FormHelperText>
               </FormControl>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                name="start_date"
                label="Start Date"
                type="date"
                value={formData.start_date}
                onChange={handleChange}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              
              <TextField
                name="end_date"
                label="End Date"
                type="date"
                value={formData.end_date}
                onChange={handleChange}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            
            <Autocomplete
              multiple
              options={[]}
              freeSolo
              filterSelectedOptions
              value={formData.tags}
              onChange={handleTagsChange}
              inputValue={tagInput}
              onInputChange={(event, newInputValue) => setTagInput(newInputValue)}
              renderTags={(value, getTagProps) =>
                (Array.isArray(value) ? value : []).map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    {...getTagProps({ index })}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tags"
                  placeholder="Add tags (press Enter to add)"
                  helperText="Add relevant tags to help categorize and search for this course"
                  onKeyDown={(event) => {
                    if ((event.key === 'Enter' || event.key === ',') && tagInput.trim()) {
                      event.preventDefault();
                      const newTag = tagInput.trim();
                      setFormData(prev => ({
                        ...prev,
                        tags: prev.tags.includes(newTag) ? prev.tags : [...prev.tags, newTag]
                      }));
                      setTagInput('');
                    }
                  }}
                />
              )}
            />
            
            <FormControl fullWidth required>
              <InputLabel>Categories</InputLabel>
              <Select
                multiple
                value={formData.category_ids}
                onChange={handleCategoriesChange}
                label="Categories"
                open={categoriesOpen}
                onOpen={() => setCategoriesOpen(true)}
                onClose={() => setCategoriesOpen(false)}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(Array.isArray(selected) ? selected : []).map((value) => {
                      const category = categories.find(cat => cat.id === value);
                      return (
                        <Chip 
                          key={value} 
                          label={category ? category.name : value} 
                          size="small" 
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {categories.length === 0 ? (
                  <MenuItem disabled>No categories available</MenuItem>
                ) : (
                  categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))
                )}
              </Select>
              <FormHelperText>
                {categories.length === 0 
                  ? 'No categories available. Please create categories first.' 
                  : 'Select one or more categories for this course'
                }
              </FormHelperText>
            </FormControl>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading || !validateForm()}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Saving...' : (course ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
