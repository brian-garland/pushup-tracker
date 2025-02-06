import React, { useState } from 'react';
import { Container, Grid, Typography, Box, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { format } from 'date-fns';
import Navigation from '../components/Navigation';
import StreakCard from '../components/StreakCard';
import PushupForm from '../components/PushupForm';
import ProgressChart from '../components/ProgressChart';
import QuoteCard from '../components/QuoteCard';
import { useLocalPushups } from '../hooks/useLocalPushups';

const PublicDashboard: React.FC = () => {
  const {
    dailyGoal,
    currentStreak,
    longestStreak,
    addEntry,
    updateDailyGoal,
    getEntries
  } = useLocalPushups();

  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState(dailyGoal.toString());

  // Fetch today's entry
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayEntries = getEntries(today, today);
  const todayEntry = todayEntries[0];
  const hasCompletedToday = todayEntry ? todayEntry.count >= dailyGoal : false;

  // Fetch recent entries for the chart (last 7 days)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 6);
  const recentEntries = getEntries(
    format(startDate, 'yyyy-MM-dd'),
    format(endDate, 'yyyy-MM-dd')
  );

  const handlePushupSuccess = (count: number) => {
    addEntry(count);
  };

  const handleUpdateGoal = () => {
    const goal = parseInt(newGoal);
    if (!isNaN(goal) && goal > 0) {
      updateDailyGoal(goal);
      setIsGoalDialogOpen(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navigation />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Welcome Message */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h4" gutterBottom>
                  Welcome to Pushup Tracker!
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {hasCompletedToday
                    ? `Great job! You've completed today's goal of ${dailyGoal} pushups!`
                    : `Today's goal: ${dailyGoal} pushups`}
                </Typography>
              </Box>
              <Button
                component={RouterLink}
                to="/register"
                variant="contained"
                color="primary"
              >
                Sign Up to Save Progress
              </Button>
            </Box>
          </Grid>

          {/* Streak Card */}
          <Grid item xs={12} md={4}>
            <StreakCard
              currentStreak={currentStreak}
              longestStreak={longestStreak}
            />
          </Grid>

          {/* Pushup Form */}
          <Grid item xs={12} md={8}>
            <PushupForm
              dailyGoal={dailyGoal}
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
                dailyGoal={dailyGoal}
              />
            )}
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Recent Activity
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setIsGoalDialogOpen(true)}
              >
                Update Daily Goal
              </Button>
            </Box>
            <Grid container spacing={2}>
              {recentEntries.map((entry) => (
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

      {/* Update Goal Dialog */}
      <Dialog open={isGoalDialogOpen} onClose={() => setIsGoalDialogOpen(false)}>
        <DialogTitle>Update Daily Goal</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Daily Goal"
            type="number"
            fullWidth
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            inputProps={{ min: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsGoalDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateGoal} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PublicDashboard; 