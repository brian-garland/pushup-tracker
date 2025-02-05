import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  styled,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { pushups } from '../services/api';

const GradientCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.dark}22 0%, ${theme.palette.secondary.dark}22 100%)`,
  backdropFilter: 'blur(10px)',
  '& .MuiCardContent-root': {
    position: 'relative',
    zIndex: 1,
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(26, 32, 44, 0.8)',
    backdropFilter: 'blur(10px)',
    '&:hover': {
      backgroundColor: 'rgba(26, 32, 44, 0.9)',
    },
    '&.Mui-focused': {
      backgroundColor: 'rgba(26, 32, 44, 1)',
    },
  },
}));

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
    <GradientCard>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Record Today's Pushups
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>
            Daily Goal: {dailyGoal} pushups
          </Typography>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2, 
              backgroundColor: 'rgba(211, 47, 47, 0.1)',
              borderRadius: 2,
            }}
          >
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
          <StyledTextField
            label="Number of Pushups"
            type="number"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            required
            inputProps={{ min: 0 }}
            sx={{ flexGrow: 1 }}
            variant="outlined"
          />
          <Button
            type="submit"
            variant="contained"
            startIcon={<AddIcon />}
            disabled={loading}
            sx={{
              height: 56,
              minWidth: 120,
              background: 'linear-gradient(45deg, #B794F4, #F687B3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #9F7AEA, #ED64A6)',
              },
            }}
          >
            {loading ? 'Recording...' : 'Record'}
          </Button>
        </Box>
      </CardContent>
    </GradientCard>
  );
};

export default PushupForm; 