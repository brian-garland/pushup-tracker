import React from 'react';
import styled from 'styled-components';
import { Card, TextField } from '@mui/material';

const GradientCard = styled(Card)(() => ({
  background: `linear-gradient(135deg, #1a202c22 0%, #2d374822 100%)`,
  backdropFilter: 'blur(10px)',
  '& .MuiCardContent-root': {
    position: 'relative',
    zIndex: 1,
  },
}));

const StyledTextField = styled(TextField)({
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
});

const PushupForm: React.FC = () => {
  // Implementation of the component
  return (
    <GradientCard>
      {/* Rest of the component content */}
    </GradientCard>
  );
};

export default PushupForm; 