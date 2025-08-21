// src/components/courses/CourseView.js
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Button
} from '@mui/material';
import { School as SchoolIcon, CalendarToday as CalendarIcon, AccessTime as AccessTimeIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { courseService } from '../../services/courseService';

export default function CourseView() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [course, setCourse] = useState(null);
  const [categories, setCategories] = useState([]);

  const loadDetails = useCallback(async () => {
    if (!courseId) {
      setError('Missing course id');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await courseService.getCourseById(courseId, token);
      setCourse(data.course || null);
      setCategories(data.categories || []);
    } catch (err) {
      setError('Failed to load course');
    } finally {
      setLoading(false);
    }
  }, [courseId, token]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDuration = (minutes) => {
    if (!minutes && minutes !== 0) return 'Not set';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
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
      <Alert severity="error">{error}</Alert>
    );
  }

  if (!course) {
    return (
      <Alert severity="warning">Course not found</Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Course Details</Typography>
        <Box display="flex" gap={1}>
          <Button variant="outlined" onClick={() => navigate('/courses')}>Back</Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Box display="flex" gap={2} alignItems="center" mb={2}>
          <SchoolIcon color="primary" />
          <Box>
            <Typography variant="h6">{course.name}</Typography>
            <Typography variant="body2" color="textSecondary">{course.description}</Typography>
          </Box>
        </Box>

        <Box display="flex" gap={3} flexWrap="wrap" mb={2}>
          <Box display="flex" alignItems="center" gap={0.5}>
            <AccessTimeIcon fontSize="small" color="action" />
            <Typography variant="body2">{formatDuration(course.duration_minutes)}</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <CalendarIcon fontSize="small" color="action" />
            <Typography variant="body2">Start: {formatDate(course.start_date)}</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <CalendarIcon fontSize="small" color="action" />
            <Typography variant="body2">End: {formatDate(course.end_date)}</Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box mb={2}>
          <Typography variant="subtitle2" gutterBottom>Categories</Typography>
          <Box display="flex" gap={0.5} flexWrap="wrap">
            {categories.length === 0 ? (
              <Typography variant="body2" color="textSecondary">No categories assigned</Typography>
            ) : (
              categories.map((cat) => (
                <Chip key={cat.id} label={cat.name} size="small" />
              ))
            )}
          </Box>
        </Box>

        <Box>
          <Typography variant="subtitle2" gutterBottom>Tags</Typography>
          <Box display="flex" gap={0.5} flexWrap="wrap">
            {Array.isArray(course.tags) && course.tags.length > 0 ? (
              course.tags.map((tag, idx) => (
                <Chip key={idx} label={tag} size="small" variant="outlined" />
              ))
            ) : (
              <Typography variant="body2" color="textSecondary">No tags</Typography>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}


