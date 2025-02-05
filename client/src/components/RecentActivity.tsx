import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  styled,
  alpha,
} from '@mui/material';
import { FitnessCenter as FitnessCenterIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import type { PushupEntry } from '../types';

const GradientCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.dark}22 0%, ${theme.palette.secondary.dark}22 100%)`,
  backdropFilter: 'blur(10px)',
  '& .MuiCardContent-root': {
    position: 'relative',
    zIndex: 1,
  },
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1),
  backgroundColor: alpha(theme.palette.background.paper, 0.5),
  backdropFilter: 'blur(10px)',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: alpha(theme.palette.background.paper, 0.8),
    transform: 'translateX(4px)',
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  borderRadius: '50%',
  padding: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
}));

interface RecentActivityProps {
  entries: PushupEntry[];
  dailyGoal: number;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ entries, dailyGoal }) => {
  const sortedEntries = [...entries]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <GradientCard>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Recent Activity
        </Typography>
        <List sx={{ px: 1 }}>
          {sortedEntries.map((entry) => (
            <StyledListItem key={entry._id}>
              <ListItemIcon>
                <IconWrapper>
                  <FitnessCenterIcon
                    sx={{
                      color: 'white',
                      fontSize: 20,
                    }}
                  />
                </IconWrapper>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {entry.count} pushups
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: entry.count >= dailyGoal ? 'success.main' : 'text.secondary',
                        fontWeight: entry.count >= dailyGoal ? 'bold' : 'regular',
                      }}
                    >
                      {entry.count >= dailyGoal ? '🎯 Goal met!' : `${dailyGoal - entry.count} to goal`}
                    </Typography>
                  </Box>
                }
                secondary={format(new Date(entry.date), 'MMM dd, yyyy')}
              />
            </StyledListItem>
          ))}
        </List>
      </CardContent>
    </GradientCard>
  );
};

export default RecentActivity; 