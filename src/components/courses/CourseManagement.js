// src/components/courses/CourseManagement.js
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import CategoryList from './CategoryList';
import CourseList from './CourseList';

export default function CourseManagement() {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Course Management
      </Typography>
      
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs 
          value={selectedTab} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Categories" />
          <Tab label="Courses" />
        </Tabs>
      </Paper>

      {selectedTab === 0 && (
        <CategoryList />
      )}
      
      {selectedTab === 1 && (
        <CourseList />
      )}
    </Box>
  );
}
