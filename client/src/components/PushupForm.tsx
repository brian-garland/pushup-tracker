import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { pushups } from '../services/api';

interface PushupFormProps {
  dailyGoal: number;
  onSuccess: (count: number) => void;
  isPublic?: boolean;
}

const PushupForm: React.FC<PushupFormProps> = ({ dailyGoal, onSuccess, isPublic = false }) => {
  const [count, setCount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const numCount = parseInt(count);
      if (isNaN(numCount) || numCount < 0) {
        throw new Error('Please enter a valid number');
      }

      if (isPublic) {
        onSuccess(numCount);
      } else {
        await pushups.createEntry(numCount);
        onSuccess(numCount);
      }
      setCount('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record pushups');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Record Today's Pushups
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Daily Goal: {dailyGoal} pushups
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'flex-start',
          }}
        >
          <TextField
            label="Number of Pushups"
            type="number"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            required
            inputProps={{ min: 0 }}
            sx={{ flexGrow: 1 }}
          />
          <Button
            type="submit"
            variant="contained"
            startIcon={<AddIcon />}
            disabled={loading}
            sx={{ height: 56 }}
          >
            {loading ? 'Recording...' : 'Record'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PushupForm; 