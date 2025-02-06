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
  styled,
  alpha,
  Theme,
} from '@mui/material';
import {
  FitnessCenter as FitnessCenterIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, 0.12)}`,
  borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
}));

const LogoIcon = styled(FitnessCenterIcon)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  borderRadius: '50%',
  padding: 8,
  fontSize: 24,
  boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
}));

const getButtonStyles = (theme: Theme) => ({
  borderRadius: 2,
  textTransform: 'none',
  fontWeight: 500,
  '&.MuiButton-outlined': {
    borderColor: alpha(theme.palette.common.white, 0.5),
    '&:hover': {
      borderColor: theme.palette.common.white,
      backgroundColor: alpha(theme.palette.common.white, 0.08),
    },
  },
  '&.MuiButton-text': {
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.08),
    },
  },
});

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const theme = useTheme();
  const buttonStyles = getButtonStyles(theme);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <StyledAppBar position="static">
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          component={RouterLink}
          to={user ? '/dashboard' : '/'}
          sx={{ mr: 2 }}
        >
          <LogoIcon />
        </IconButton>
        
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 'bold',
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Pushup Tracker
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {!user ? (
            <>
              <Button
                color="inherit"
                component={RouterLink}
                to="/login"
                sx={buttonStyles}
              >
                Sign In
              </Button>
              <Button
                color="inherit"
                component={RouterLink}
                to="/register"
                variant="outlined"
                sx={buttonStyles}
              >
                Sign Up
              </Button>
            </>
          ) : (
            <>
              <Typography
                variant="body2"
                sx={{
                  mr: 2,
                  color: alpha(theme.palette.common.white, 0.7),
                }}
              >
                Welcome, {user.name}
              </Typography>
              
              <Button
                color="inherit"
                startIcon={<PersonIcon />}
                component={RouterLink}
                to="/profile"
                sx={buttonStyles}
              >
                Profile
              </Button>
              
              <Button
                color="inherit"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{
                  ...buttonStyles,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.common.white, 0.08),
                    color: theme.palette.error.main,
                  },
                }}
              >
                Logout
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Navigation; 