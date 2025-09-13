import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
} from '@mui/material';
import styled from 'styled-components';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import { jwtDecode } from 'jwt-decode';
//comment
const StyledPaper = styled(Paper)`
  padding: 2rem;
  text-align: center;
  background: linear-gradient(45deg, #2d2d2d 30%, #1a1a1a 90%);
  border: 2px solid #00ff00;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 0 30px rgba(0, 255, 0, 0.5);
  }
`;

const StyledButton = styled(Button)`
  margin-top: 1rem;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  background: linear-gradient(45deg, #00ff00 30%, #00cc00 90%);
  color: #000;
  border: none;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(45deg, #00cc00 30%, #009900 90%);
    transform: scale(1.05);
  }
`;

const Home = () => {
  const navigate = useNavigate();

  // Get user role from JWT token
  let role = null;
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      role = decoded.role;
    }
  } catch (e) {
    role = null;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(45deg, #1a1a1a 30%, #2d2d2d 90%)',
        py: 8,
      }}
    >
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <Button variant="contained" color="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </Box>
      <Container maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            textAlign: 'center',
            color: '#00ff00',
            textShadow: '0 0 10px rgba(0, 255, 0, 0.5)',
            mb: 6,
          }}
        >
          QuizVerse
        </Typography>
        <Grid container spacing={4} justifyContent="center" alignItems="center">
          {role === 'host' && (
            <>
              <Grid item xs={12} md={4}>
                <StyledPaper>
                  <SportsEsportsIcon sx={{ fontSize: 60, color: '#00ff00', mb: 2 }} />
                  <Typography variant="h5" gutterBottom>
                    Create Room
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Create your own quiz room and host the game
                  </Typography>
                  <StyledButton
                    variant="contained"
                    onClick={() => navigate('/create-room')}
                    fullWidth
                  >
                    Create Room
                  </StyledButton>
                </StyledPaper>
              </Grid>
              <Grid item xs={12} md={4}>
                <StyledPaper>
                  <PersonIcon sx={{ fontSize: 60, color: '#00ff00', mb: 2 }} />
                  <Typography variant="h5" gutterBottom>
                    Join as Host
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Join an existing room as a host
                  </Typography>
                  <StyledButton
                    variant="contained"
                    onClick={() => navigate('/join-room?role=host')}
                    fullWidth
                  >
                    Join as Host
                  </StyledButton>
                </StyledPaper>
              </Grid>
              <Grid item xs={12} md={4}>
                <StyledPaper>
                  <GroupIcon sx={{ fontSize: 60, color: '#00ff00', mb: 2 }} />
                  <Typography variant="h5" gutterBottom>
                    My Rooms
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    View all rooms you have created
                  </Typography>
                  <StyledButton
                    variant="contained"
                    onClick={() => navigate('/user-rooms')}
                    fullWidth
                  >
                    My Rooms
                  </StyledButton>
                </StyledPaper>
              </Grid>
            </>
          )}
          {role === 'player' && (
            <>
              <Grid item xs={12} md={6}>
                <StyledPaper>
                  <GroupIcon sx={{ fontSize: 60, color: '#00ff00', mb: 2 }} />
                  <Typography variant="h5" gutterBottom>
                    Join as Player
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Join an existing room as a player
                  </Typography>
                  <StyledButton
                    variant="contained"
                    onClick={() => navigate('/join-room?role=player')}
                    fullWidth
                  >
                    Join as Player
                  </StyledButton>
                </StyledPaper>
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledPaper>
                  <PersonIcon sx={{ fontSize: 60, color: '#00ff00', mb: 2 }} />
                  <Typography variant="h5" gutterBottom>
                    Joined Rooms
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    View all rooms you have joined
                  </Typography>
                  <StyledButton
                    variant="contained"
                    onClick={() => navigate('/user-rooms')}
                    fullWidth
                  >
                    Joined Rooms
                  </StyledButton>
                </StyledPaper>
              </Grid>
            </>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;