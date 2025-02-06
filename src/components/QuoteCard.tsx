import React, { useEffect } from 'react';
import { useQuery } from 'react-query';
import { quotes } from '../services/quotes';
import { Quote } from '../types/Quote';

const QuoteCard: React.FC = () => {
  const { data: quote, isLoading } = useQuery<Quote>(
    'quote',
    quotes.getRandomQuote,
    {
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      staleTime: 0,
      retry: 1,
      onError: (err) => {
        console.error('Error fetching quote:', err);
      }
    }
  );

  useEffect(() => {
    // Handle any additional logic after fetching the quote
  }, [quote]);

  return (
    <div>
      {/* Render your component content here */}
    </div>
  );
};

export default QuoteCard; 