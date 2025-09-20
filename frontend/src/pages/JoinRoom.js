import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
} from '@mui/material';
import styled from 'styled-components';
import axios from 'axios';
//comment
const StyledPaper = styled(Paper)`
  padding: 2rem;
  background: linear-gradient(45deg, #2d2d2d 30%, #1a1a1a 90%);
  border: 2px solid #00ff00;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
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

const JoinRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = new URLSearchParams(location.search).get('role');
  const [formData, setFormData] = useState({
    roomCode: '',
    hostPin: '',
    username: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (role === 'host') {
        const response = await axios.post('https://quizzverse-cv88.onrender.com/api/rooms/join/host', {
          roomCode: formData.roomCode.trim(),
          hostPin: formData.hostPin,
        });
        navigate(`/waiting-room/${response.data._id}`, {
          state: { isHost: true },
        });
      } else {
        const response = await axios.post('https://quizzverse-cv88.onrender.com/api/rooms/join/player', {
          roomCode: formData.roomCode.trim(),
          username: formData.username,
        });
        navigate(`/waiting-room/${response.data.room._id}`, {
          state: { isHost: false, playerId: response.data.player._id },
        });
      }
    } catch (error) {
      console.error('Error joining room:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(45deg, #1a1a1a 30%, #2d2d2d 90%)',
        py: 8,
      }}
    >
      <Container maxWidth="sm">
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            textAlign: 'center',
            color: '#00ff00',
            textShadow: '0 0 10px rgba(0, 255, 0, 0.5)',
            mb: 4,
          }}
        >
          Join Room
        </Typography>

        <StyledPaper>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Room Code"
              name="roomCode"
              value={formData.roomCode}
              onChange={handleChange}
              variant="outlined"
              sx={{ mb: 2 }}
              required
            />

            {role === 'host' ? (
              <TextField
                fullWidth
                label="Host Pin"
                name="hostPin"
                value={formData.hostPin}
                onChange={handleChange}
                variant="outlined"
                sx={{ mb: 2 }}
                required
              />
            ) : (
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                variant="outlined"
                sx={{ mb: 2 }}
                required
              />
            )}

            <StyledButton type="submit" variant="contained" fullWidth disabled={loading}>
              {loading ? 'Joining...' : 'Join Room'}
            </StyledButton>
          </form>
        </StyledPaper>
      </Container>
    </Box>
  );
};

export default JoinRoom; 