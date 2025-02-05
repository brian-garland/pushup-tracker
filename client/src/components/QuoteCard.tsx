import React from 'react';
import { Card, CardContent, Typography, Box, CircularProgress, styled, alpha } from '@mui/material';
import { FormatQuote as QuoteIcon } from '@mui/icons-material';
import { useQuery } from 'react-query';
import { quotes } from '../services/api';
import type { Quote } from '../types';

const GradientCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.secondary.dark}22 0%, ${theme.palette.primary.dark}22 100%)`,
  backdropFilter: 'blur(10px)',
  '& .MuiCardContent-root': {
    position: 'relative',
    zIndex: 1,
  },
}));

const QuoteIconWrapper = styled(Box)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  borderRadius: '50%',
  padding: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
  marginRight: theme.spacing(2),
}));

const QuoteCard: React.FC = () => {
  const { data: quote, isLoading, error } = useQuery<Quote>(
    'quote',
    quotes.getRandomQuote,
    {
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      staleTime: 0,
      retry: 1,
      onError: (error) => {
        console.error('Error fetching quote:', error);
      }
    }
  );

  return (
    <GradientCard>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, minHeight: 100 }}>
          <QuoteIconWrapper>
            <QuoteIcon sx={{ color: 'white', fontSize: 24 }} />
          </QuoteIconWrapper>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 2 }}>
              <CircularProgress
                size={24}
                sx={{
                  color: (theme) => theme.palette.secondary.main,
                }}
              />
            </Box>
          ) : quote ? (
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body1"
                gutterBottom
                sx={{
                  fontStyle: 'italic',
                  fontSize: '1.1rem',
                  lineHeight: 1.6,
                  color: (theme) => alpha(theme.palette.common.white, 0.9),
                }}
              >
                "{quote.content}"
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{
                  color: (theme) => alpha(theme.palette.common.white, 0.7),
                  fontWeight: 500,
                  mt: 1,
                }}
              >
                — {quote.author}
              </Typography>
            </Box>
          ) : (
            <Typography
              color="error"
              sx={{
                backgroundColor: (theme) => alpha(theme.palette.error.main, 0.1),
                padding: 2,
                borderRadius: 1,
                width: '100%',
              }}
            >
              Failed to load quote. Please refresh the page.
            </Typography>
          )}
        </Box>
      </CardContent>
    </GradientCard>
  );
};

export default QuoteCard; 