import { Quote } from '../types/Quote';

const FALLBACK_QUOTES: Quote[] = [
  {
    content: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
  },
  {
    content: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    content: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius"
  }
];

export const quotes = {
  getRandomQuote: async (): Promise<Quote> => {
    try {
      const response = await fetch('https://api.quotable.io/random?tags=inspirational,motivational');
      if (!response.ok) {
        throw new Error('Failed to fetch quote');
      }
      const data = await response.json();
      return {
        content: data.content,
        author: data.author
      };
    } catch (error) {
      // Return a random fallback quote
      const randomIndex = Math.floor(Math.random() * FALLBACK_QUOTES.length);
      return FALLBACK_QUOTES[randomIndex];
    }
  }
}; 