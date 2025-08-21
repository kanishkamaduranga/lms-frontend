// src/components/courses/CourseList.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Tooltip,
  Avatar
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  School as SchoolIcon,
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarIcon,
  Label as LabelIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { courseService } from '../../services/courseService';
import { userService } from '../../services/userService';
import CourseForm from './CourseForm';

export default function CourseList() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  useEffect(() => {
    loadCourses();
    loadInstructors();
  }, []);

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await courseService.getAllCourses(token);
      setCourses(data.courses || []);
    } catch (err) {
      setError('Failed to load courses');
      console.error('Error loading courses:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const loadInstructors = useCallback(async () => {
    try {
      const data = await userService.getByRole('Instructor', token);
      setInstructors(data.users || []);
    } catch (err) {
      console.error('Error loading instructors:', err);
    }
  }, [token]);

  const handleCreate = () => {
    setEditingCourse(null);
    setOpenForm(true);
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setOpenForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        await courseService.deleteCourse(id, token);
        loadCourses();
      } catch (err) {
        setError('Failed to delete course');
      }
    }
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusChip = (course) => {
    const now = new Date();
    const startDate = new Date(course.start_date);
    const endDate = new Date(course.end_date);

    if (now < startDate) {
      return <Chip label="Upcoming" color="info" size="small" />;
    } else if (now >= startDate && now <= endDate) {
      return <Chip label="Active" color="success" size="small" />;
    } else {
      return <Chip label="Completed" color="default" size="small" />;
    }
  };

  const getInstructorName = (instructorId) => {
    const instructor = instructors.find(inst => inst.id === instructorId);
    return instructor ? instructor.full_name : 'Not assigned';
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
        <Typography variant="h4">Courses</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Add Course
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
              <TableCell sx={{ minWidth: 200 }}>Course</TableCell>
              <TableCell sx={{ minWidth: 150 }}>Duration</TableCell>
              <TableCell sx={{ minWidth: 120 }}>Status</TableCell>
              <TableCell sx={{ minWidth: 120 }}>Instructor</TableCell>
              <TableCell sx={{ minWidth: 120 }}>Start Date</TableCell>
              <TableCell sx={{ minWidth: 120 }}>End Date</TableCell>
              <TableCell sx={{ minWidth: 150 }}>Categories</TableCell>
              <TableCell sx={{ minWidth: 150 }}>Tags</TableCell>
              <TableCell sx={{ minWidth: 150 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                      <SchoolIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {course.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ 
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {course.description}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <AccessTimeIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {formatDuration(course.duration_minutes)}
                    </Typography>
                  </Box>
                </TableCell>
                                 <TableCell>
                   {getStatusChip(course)}
                 </TableCell>
                 <TableCell>
                   <Typography variant="body2" color="textSecondary">
                     {getInstructorName(course.instructor_id)}
                   </Typography>
                 </TableCell>
                 <TableCell>
                   <Box display="flex" alignItems="center" gap={0.5}>
                     <CalendarIcon fontSize="small" color="action" />
                     <Typography variant="body2">
                       {formatDate(course.start_date)}
                     </Typography>
                   </Box>
                 </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <CalendarIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {formatDate(course.end_date)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {course.category_ids && course.category_ids.map((categoryId, index) => (
                      <Chip 
                        key={index}
                        label={`Category ${categoryId}`} 
                        size="small" 
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {course.tags && course.tags.map((tag, index) => (
                      <Chip 
                        key={index}
                        label={tag} 
                        size="small" 
                        variant="outlined"
                        icon={<LabelIcon />}
                      />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={0.5} flexWrap="nowrap">
                    <Tooltip title="View Course">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => navigate(`/courses/${course.id}`)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Edit Course">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(course)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Delete Course">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(course.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
                         {courses.length === 0 && (
               <TableRow>
                 <TableCell colSpan={9} align="center">
                  <Box py={4}>
                    <SchoolIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body2" color="textSecondary">
                      No courses found. Create your first course to get started.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <CourseForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSave={loadCourses}
        course={editingCourse}
        token={token}
      />
    </Box>
  );
}
