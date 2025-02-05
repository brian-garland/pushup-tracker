import React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  useTheme,
} from '@mui/material';
import {
  FitnessCenter as FitnessCenterIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

interface NavigationProps {
  isPublic?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ isPublic = false }) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const theme = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          component={RouterLink}
          to="/"
          sx={{ mr: 2 }}
        >
          <FitnessCenterIcon />
        </IconButton>
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Pushup Tracker
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isPublic ? (
            <>
              <Button
                color="inherit"
                component={RouterLink}
                to="/login"
              >
                Sign In
              </Button>
              <Button
                color="inherit"
                component={RouterLink}
                to="/register"
                variant="outlined"
                sx={{ borderColor: 'white' }}
              >
                Sign Up
              </Button>
            </>
          ) : (
            <>
              <Typography variant="body2" sx={{ mr: 2 }}>
                Welcome, {user?.name}
              </Typography>
              
              <Button
                color="inherit"
                startIcon={<PersonIcon />}
                component={RouterLink}
                to="/profile"
              >
                Profile
              </Button>
              
              <Button
                color="inherit"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation; 