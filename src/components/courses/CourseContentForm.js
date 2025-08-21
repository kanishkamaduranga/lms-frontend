// src/components/courses/CourseContentForm.js
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
  CircularProgress,
  Typography,
  Divider
} from '@mui/material';
import {
  TextFields as TextIcon,
  PictureAsPdf as PdfIcon,
  Slideshow as PptIcon,
  VideoLibrary as VideoIcon,
  Quiz as QuizIcon
} from '@mui/icons-material';
import { courseService } from '../../services/courseService';

const CONTENT_TYPES = [
  { value: 'text', label: 'Text Content', icon: TextIcon },
  { value: 'pdf', label: 'PDF Document', icon: PdfIcon },
  { value: 'ppt', label: 'PowerPoint Presentation', icon: PptIcon },
  { value: 'video', label: 'Video', icon: VideoIcon },
  { value: 'quiz', label: 'Quiz', icon: QuizIcon }
];

export default function CourseContentForm({ open, onClose, onSave, courseId, content, token }) {
  const [formData, setFormData] = useState({
    content_type: 'text',
    content_text: '',
    file_url: '',
    metadata: {},
    position: 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (content) {
      setFormData({
        content_type: content.content_type || 'text',
        content_text: content.content_text || '',
        file_url: content.file_url || '',
        metadata: content.metadata || {},
        position: content.position || 1
      });
    } else {
      setFormData({
        content_type: 'text',
        content_text: '',
        file_url: '',
        metadata: {},
        position: 1
      });
    }
  }, [content]);

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

    // Validate based on content type
    if (formData.content_type === 'text' && !formData.content_text.trim()) {
      setError('Text content is required for text type');
      setLoading(false);
      return;
    }

    if (['pdf', 'ppt', 'video'].includes(formData.content_type) && !formData.file_url.trim()) {
      setError('File URL is required for this content type');
      setLoading(false);
      return;
    }

    try {
      if (content) {
        // Update existing content
        await courseService.updateCourseContent(courseId, content.id, formData, token);
      } else {
        // Add new content
        await courseService.addCourseContent(courseId, formData, token);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save content');
    } finally {
      setLoading(false);
    }
  };

  const renderContentTypeFields = () => {
    switch (formData.content_type) {
      case 'text':
        return (
          <TextField
            name="content_text"
            label="Text Content"
            value={formData.content_text}
            onChange={handleChange}
            required
            fullWidth
            multiline
            rows={6}
            placeholder="Enter your text content here..."
            helperText="Support for markdown formatting"
          />
        );
      
      case 'pdf':
        return (
          <TextField
            name="file_url"
            label="PDF File URL"
            value={formData.file_url}
            onChange={handleChange}
            required
            fullWidth
            placeholder="https://example.com/document.pdf"
            helperText="Provide a direct link to the PDF file"
          />
        );
      
      case 'ppt':
        return (
          <TextField
            name="file_url"
            label="PowerPoint File URL"
            value={formData.file_url}
            onChange={handleChange}
            required
            fullWidth
            placeholder="https://example.com/presentation.pptx"
            helperText="Provide a direct link to the PowerPoint file"
          />
        );
      
      case 'video':
        return (
          <TextField
            name="file_url"
            label="Video URL"
            value={formData.file_url}
            onChange={handleChange}
            required
            fullWidth
            placeholder="https://www.youtube.com/watch?v=..."
            helperText="YouTube, Vimeo, or direct video file URL"
          />
        );
      
      case 'quiz':
        return (
          <Box>
            <TextField
              name="content_text"
              label="Quiz Instructions"
              value={formData.content_text}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              placeholder="Enter quiz instructions or description..."
              sx={{ mb: 2 }}
            />
            <TextField
              name="file_url"
              label="Quiz Configuration URL"
              value={formData.file_url}
              onChange={handleChange}
              fullWidth
              placeholder="https://example.com/quiz-config.json"
              helperText="URL to quiz configuration file (optional)"
            />
          </Box>
        );
      
      default:
        return null;
    }
  };

  const getContentTypeIcon = (type) => {
    const contentType = CONTENT_TYPES.find(ct => ct.value === type);
    return contentType ? React.createElement(contentType.icon) : null;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {content ? 'Edit Course Content' : 'Add Course Content'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Content Type</InputLabel>
              <Select
                name="content_type"
                value={formData.content_type}
                onChange={handleChange}
                label="Content Type"
              >
                {CONTENT_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {React.createElement(type.icon)}
                      {type.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box display="flex" alignItems="center" gap={1} p={2} bgcolor="grey.50" borderRadius={1}>
              {getContentTypeIcon(formData.content_type)}
              <Typography variant="body2" color="textSecondary">
                {CONTENT_TYPES.find(ct => ct.value === formData.content_type)?.label}
              </Typography>
            </Box>

            <Divider />

            {renderContentTypeFields()}

            <TextField
              name="position"
              label="Position"
              type="number"
              value={formData.position}
              onChange={handleChange}
              fullWidth
              inputProps={{ min: 1 }}
              helperText="Order in which this content appears in the course (1 = first)"
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
            {loading ? 'Saving...' : (content ? 'Update' : 'Add')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
