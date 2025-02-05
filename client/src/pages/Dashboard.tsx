import React from 'react';
import { Container, Grid, Typography, Box } from '@mui/material';
import { useQuery, useQueryClient } from 'react-query';
import { format } from 'date-fns';
import Navigation from '../components/Navigation';
import StreakCard from '../components/StreakCard';
import PushupForm from '../components/PushupForm';
import ProgressChart from '../components/ProgressChart';
import QuoteCard from '../components/QuoteCard';
import { useAuth } from '../hooks/useAuth';
import { pushups } from '../services/api';
import type { PushupEntry } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch today's entry
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: entries } = useQuery<PushupEntry[]>(['pushups', today], () =>
    pushups.getEntries(today, today)
  );

  // Fetch recent entries for the chart (last 7 days)
  const { data: recentEntries } = useQuery<PushupEntry[]>(['pushups', 'recent'], () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);
    return pushups.getEntries(
      format(startDate, 'yyyy-MM-dd'),
      format(endDate, 'yyyy-MM-dd')
    );
  });

  const handlePushupSuccess = () => {
    // Invalidate queries to refetch data
    queryClient.invalidateQueries(['pushups']);
  };

  const todayEntry = entries?.[0];
  const hasCompletedToday = todayEntry ? todayEntry.count >= (user?.dailyGoal || 0) : false;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navigation />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Welcome Message */}
          <Grid item xs={12}>
            <Typography variant="h4" gutterBottom>
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
            />
          </Grid>

          {/* Motivational Quote */}
          <Grid item xs={12}>
            <QuoteCard />
          </Grid>

          {/* Progress Chart */}
          <Grid item xs={12}>
            {recentEntries && recentEntries.length > 0 && (
              <ProgressChart
                entries={recentEntries}
                dailyGoal={user?.dailyGoal || 0}
              />
            )}
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
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
                    }}
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