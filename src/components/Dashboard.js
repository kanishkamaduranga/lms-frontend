// src/components/Dashboard.js
import { Typography, Box } from '@mui/material';
import DashboardLayout from './DashboardLayout';

function Dashboard() {
  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to Your Dashboard
        </Typography>
        {/* Add your dashboard content here */}
      </Box>
    </DashboardLayout>
  );
}

export default Dashboard;