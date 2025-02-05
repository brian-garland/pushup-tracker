import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { LocalFireDepartment as FireIcon } from '@mui/icons-material';

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
}

const StreakCard: React.FC<StreakCardProps> = ({ currentStreak, longestStreak }) => {
  return (
    <Card elevation={3}>
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FireIcon color="error" sx={{ fontSize: 40 }} />
            <Typography variant="h4" component="div">
              {currentStreak} Day{currentStreak !== 1 ? 's' : ''}
            </Typography>
          </Box>
          
          <Typography variant="subtitle1" color="text.secondary">
            Current Streak
          </Typography>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Longest Streak
            </Typography>
            <Typography variant="h6">
              {longestStreak} Day{longestStreak !== 1 ? 's' : ''}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StreakCard; 