import React, { useState } from 'react';
import { Container, Grid, Typography, Box, Card } from '@mui/material';
import { useQuery, useQueryClient } from 'react-query';
import { format } from 'date-fns';
import Navigation from '../components/Navigation';
import StreakCard from '../components/StreakCard';
import PushupForm from '../components/PushupForm';
import CalendarView from '../components/CalendarView';
import QuoteCard from '../components/QuoteCard';
import { useAuth } from '../hooks/useAuth';
import { pushups } from '../services/api';
import type { PushupEntry } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  // Fetch today's entry
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: entries, refetch: refetchToday } = useQuery<PushupEntry[]>(
    ['pushups', 'today'],
    async () => {
      console.log('Fetching today\'s entries...');
      const data = await pushups.getEntries(today, today);
      console.log('Today\'s entries:', data);
      return data;
    },
    {
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchInterval: 0,
      staleTime: 0,
      cacheTime: 0,
    }
  );

  // Fetch recent entries for the chart (last 28 days)
  const { data: recentEntries, refetch: refetchRecent } = useQuery<PushupEntry[]>(
    ['pushups', 'recent'],
    async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 27);
      
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      console.log('Fetching entries from', formattedStartDate, 'to', formattedEndDate);
      const data = await pushups.getEntries(formattedStartDate, formattedEndDate);
      console.log('Received entries:', data);
      return data;
    },
    {
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchInterval: 0,
      staleTime: 0,
      cacheTime: 0,
    }
  );

  const handlePushupSuccess = async () => {
    try {
      console.log('Handling pushup success...');
      // First invalidate all pushup-related queries
      await queryClient.invalidateQueries(['pushups']);
      console.log('Queries invalidated');
      
      // Then explicitly refetch both queries
      console.log('Refetching data...');
      const [todayResult, recentResult] = await Promise.all([
        refetchToday(),
        refetchRecent()
      ]);
      console.log('Refetch results:', {
        today: todayResult.data,
        recent: recentResult.data
      });
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
  };

  const todayEntry = entries?.[0];
  const hasCompletedToday = todayEntry ? todayEntry.count >= (user?.dailyGoal || 0) : false;
  const selectedDateEntry = recentEntries?.find(entry => 
    format(new Date(entry.date), 'yyyy-MM-dd') === selectedDate
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navigation />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Welcome Message */}
          <Grid item xs={12}>
            <Typography variant="h4" gutterBottom sx={{ color: theme => theme.palette.primary.light }}>
              Welcome back, {user?.name}!
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {hasCompletedToday
                ? `Great job! You've completed today's goal of ${user?.dailyGoal} pushups!`
                : `Today's goal: ${user?.dailyGoal} pushups`}
            </Typography>
          </Grid>

          {/* Streak Card */}
          <Grid item xs={12} md={4}>
            <StreakCard
              currentStreak={user?.currentStreak || 0}
              longestStreak={user?.longestStreak || 0}
            />
          </Grid>

          {/* Pushup Form */}
          <Grid item xs={12} md={8}>
            <PushupForm
              dailyGoal={user?.dailyGoal || 0}
              onSuccess={handlePushupSuccess}
              selectedDate={selectedDate !== today ? selectedDate : undefined}
            />
          </Grid>

          {/* Motivational Quote */}
          <Grid item xs={12}>
            <QuoteCard />
          </Grid>

          {/* Calendar View */}
          <Grid item xs={12}>
            {recentEntries && (
              <CalendarView
                entries={recentEntries}
                dailyGoal={user?.dailyGoal || 0}
                onDayClick={handleDayClick}
                selectedDate={selectedDate}
              />
            )}
          </Grid>

          {/* Selected Day Info */}
          {selectedDate !== today && selectedDateEntry && (
            <Grid item xs={12}>
              <Card sx={{ bgcolor: 'background.paper', p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {format(new Date(selectedDateEntry.date), 'MMMM d, yyyy')}
                </Typography>
                <Typography>
                  Pushups completed: {selectedDateEntry.count}
                </Typography>
                <Typography color={selectedDateEntry.goalMet ? 'success.main' : 'error.main'}>
                  {selectedDateEntry.goalMet ? 'Goal completed!' : 'Goal not met'}
                </Typography>
              </Card>
            </Grid>
          )}

          {/* Recent Activity */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 4, color: theme => theme.palette.secondary.light }}>
              Recent Activity
            </Typography>
            <Grid container spacing={2}>
              {recentEntries?.map((entry: PushupEntry) => (
                <Grid item xs={12} sm={6} md={4} key={entry._id}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                      boxShadow: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'background.default',
                      },
                    }}
                    onClick={() => handleDayClick(format(new Date(entry.date), 'yyyy-MM-dd'))}
                  >
                    <Typography variant="subtitle2" color="text.secondary">
                      {format(new Date(entry.date), 'MMM dd, yyyy')}
                    </Typography>
                    <Typography variant="h6">
                      {entry.count} pushups
                    </Typography>
                    <Typography
                      variant="body2"
                      color={entry.goalMet ? 'success.main' : 'error.main'}
                    >
                      {entry.goalMet ? 'Goal completed' : 'Goal not met'}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard; 