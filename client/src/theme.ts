import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#B794F4', // Purple
      light: '#D6BCFA',
      dark: '#9F7AEA',
    },
    secondary: {
      main: '#F687B3', // Pink
      light: '#FBB6CE',
      dark: '#ED64A6',
    },
    background: {
      default: '#171923',
      paper: '#1A202C',
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      opacity: 0.8,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#1A202C',
          borderRadius: 24,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 24,
            padding: '2px',
            background: 'linear-gradient(45deg, #B794F4, #F687B3)',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 16px',
        },
        contained: {
          backgroundImage: 'linear-gradient(45deg, #B794F4, #F687B3)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            backgroundImage: 'linear-gradient(45deg, #9F7AEA, #ED64A6)',
            boxShadow: '0 6px 8px rgba(0, 0, 0, 0.2)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1A202C',
          backgroundImage: 'none',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
  },
});

export default theme; 