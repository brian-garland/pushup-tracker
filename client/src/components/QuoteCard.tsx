import React from 'react';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import { FormatQuote as QuoteIcon } from '@mui/icons-material';
import { useQuery } from 'react-query';
import { quotes } from '../services/api';
import type { Quote } from '../types';

const QuoteCard: React.FC = () => {
  const { data: quote, isLoading, error } = useQuery<Quote>('quote', quotes.getRandomQuote, {
    refetchOnWindowFocus: false,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: 2,
  });

  if (error) {
    return null; // Silently fail if we can't load a quote
  }

  return (
    <Card elevation={3}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, minHeight: 100 }}>
          <QuoteIcon color="primary" sx={{ fontSize: 40 }} />
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : quote ? (
            <Box>
              <Typography variant="body1" gutterBottom sx={{ fontStyle: 'italic' }}>
                "{quote.content}"
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                — {quote.author}
              </Typography>
            </Box>
          ) : null}
        </Box>
      </CardContent>
    </Card>
  );
};

export default QuoteCard; 