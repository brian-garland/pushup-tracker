import React from 'react';
import { Card, CardContent, Typography, Box, Grid, styled, alpha } from '@mui/material';
import { format, eachDayOfInterval, subDays, isToday, startOfDay, parseISO } from 'date-fns';
import type { PushupEntry } from '../types';

const GradientCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.dark}22 0%, ${theme.palette.secondary.dark}22 100%)`,
  backdropFilter: 'blur(10px)',
  '& .MuiCardContent-root': {
    position: 'relative',
    zIndex: 1,
  },
}));

const CalendarDay = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isGoalMet' && prop !== 'isSelected',
})<{ isGoalMet?: boolean; isSelected?: boolean }>(({ theme, isGoalMet, isSelected }) => ({
  width: '100%',
  aspectRatio: '1',
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  position: 'relative',
  background: isGoalMet 
    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)}, ${alpha(theme.palette.secondary.main, 0.15)})`
    : alpha(theme.palette.background.paper, 0.1),
  border: isSelected
    ? `2px solid ${theme.palette.secondary.main}`
    : '2px solid transparent',
  '&:hover': {
    transform: 'scale(1.05)',
    background: isGoalMet 
      ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.25)}, ${alpha(theme.palette.secondary.main, 0.25)})`
      : alpha(theme.palette.background.paper, 0.2),
  },
  '&::after': isGoalMet ? {
    content: '""',
    position: 'absolute',
    top: '4px',
    right: '4px',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: theme.palette.secondary.main,
    boxShadow: `0 0 8px ${theme.palette.secondary.main}`,
  } : undefined,
}));

interface CalendarViewProps {
  entries: PushupEntry[];
  dailyGoal: number;
  onDayClick?: (date: string) => void;
  selectedDate?: string;
}

const CalendarView: React.FC<CalendarViewProps> = ({ 
  entries, 
  dailyGoal,
  onDayClick,
  selectedDate 
}) => {
  const getEntryForDate = (date: Date) => {
    const formattedSearchDate = format(startOfDay(date), 'yyyy-MM-dd');
    
    const foundEntry = entries.find(entry => {
      const entryDate = parseISO(entry.date);
      const formattedEntryDate = format(startOfDay(entryDate), 'yyyy-MM-dd');
      return formattedSearchDate === formattedEntryDate;
    });
    
    return foundEntry;
  };

  // Get current timezone with proper typing
  const timezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone;
  console.log('Calendar timezone:', timezone);

  // Get last 28 days using startOfDay to normalize the time in local timezone
  const today = startOfDay(new Date());
  
  const daysToShow = eachDayOfInterval({
    start: subDays(today, 27),
    end: today,
  }).map(date => startOfDay(date));

  return (
    <GradientCard>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Progress Overview
        </Typography>
        <Grid container spacing={1}>
          {daysToShow.map((date) => {
            const entry = getEntryForDate(date);
            const isGoalMet = entry ? entry.count >= dailyGoal : false;
            const formattedDate = format(date, 'yyyy-MM-dd');
            const isSelected = selectedDate === formattedDate;

            return (
              <Grid item xs={1.5} sm={1.7142} key={formattedDate}>
                <CalendarDay 
                  isGoalMet={isGoalMet}
                  isSelected={isSelected}
                  onClick={() => onDayClick?.(formattedDate)}
                  sx={{
                    border: isToday(date) ? '2px solid rgba(255,255,255,0.2)' : undefined,
                  }}
                >
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      opacity: 0.7,
                      fontSize: { xs: '0.6rem', sm: '0.75rem' }
                    }}
                  >
                    {format(date, 'MMM')}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 'bold',
                      fontSize: { xs: '0.8rem', sm: '1rem' }
                    }}
                  >
                    {format(date, 'd')}
                  </Typography>
                  {entry && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        opacity: 0.9,
                        fontSize: { xs: '0.6rem', sm: '0.75rem' },
                        color: isGoalMet ? 'secondary.main' : 'text.secondary'
                      }}
                    >
                      {entry.count}
                    </Typography>
                  )}
                </CalendarDay>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </GradientCard>
  );
};

export default CalendarView; 