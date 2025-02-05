import React from 'react';
import { Card, CardContent, Typography, Box, styled } from '@mui/material';
import { LocalFireDepartment as FireIcon } from '@mui/icons-material';

const GradientCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.secondary.dark}22 0%, ${theme.palette.primary.dark}22 100%)`,
  backdropFilter: 'blur(10px)',
  '& .MuiCardContent-root': {
    position: 'relative',
    zIndex: 1,
  },
}));

const ProgressCircle = styled(Box)<{ value: number }>(({ theme, value }) => ({
  position: 'relative',
  width: 120,
  height: 120,
  borderRadius: '50%',
  background: `conic-gradient(
    ${theme.palette.secondary.main} ${value}%,
    rgba(255, 255, 255, 0.1) ${value}%
  )`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '84%',
    height: '84%',
    borderRadius: '50%',
    background: theme.palette.background.paper,
  },
}));

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
}

const StreakCard: React.FC<StreakCardProps> = ({ currentStreak, longestStreak }) => {
  // Calculate progress percentage (max at 100%)
  const progress = Math.min((currentStreak / (longestStreak || 1)) * 100, 100);

  return (
    <GradientCard>
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <Box sx={{ position: 'relative' }}>
            <ProgressCircle value={progress}>
              <Box sx={{ position: 'relative', textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: -0.5 }}>
                  {currentStreak}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {currentStreak !== 1 ? 'DAYS' : 'DAY'}
                </Typography>
              </Box>
            </ProgressCircle>
            <FireIcon
              sx={{
                position: 'absolute',
                top: -10,
                right: -10,
                fontSize: 32,
                color: 'secondary.main',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
              }}
            />
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle1" sx={{ opacity: 0.8, mb: 1 }}>
              Current Streak
            </Typography>
            <Box sx={{ 
              p: 1.5, 
              bgcolor: 'rgba(255,255,255,0.05)', 
              borderRadius: 2,
              backdropFilter: 'blur(10px)',
            }}>
              <Typography variant="subtitle2" sx={{ opacity: 0.7, mb: 0.5 }}>
                Longest Streak
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {longestStreak} {longestStreak !== 1 ? 'Days' : 'Day'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </GradientCard>
  );
};

export default StreakCard; 