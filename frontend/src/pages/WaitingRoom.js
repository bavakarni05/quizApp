import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import styled from 'styled-components';
import axios from 'axios';
import io from 'socket.io-client';
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

const PlayerList = styled(List)`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  margin-top: 1rem;
`;

const WaitingRoom = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isHost, roomCode, hostPin, playerId } = location.state || {};
  const [room, setRoom] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.emit('joinRoom', { roomId });

    newSocket.on('playerJoined', (updatedRoom) => {
      setRoom(updatedRoom);
    });

    newSocket.on('gameStarted', () => {
      navigate(`/quiz-room/${roomId}`, {
        state: { isHost, playerId }
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId, navigate]);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/rooms/${roomId}`);
        setRoom(response.data);
      } catch (error) {
        console.error('Error fetching room:', error);
      }
    };

    fetchRoom();
  }, [roomId]);

  const handleStartQuiz = async () => {
    try {
      await axios.post(`http://localhost:5000/api/rooms/${roomId}/start`);
      socket.emit('startGame', { roomId });
    } catch (error) {
      console.error('Error starting quiz:', error);
    }
  };

  if (!room) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(45deg, #1a1a1a 30%, #2d2d2d 90%)',
        }}
      >
        <CircularProgress sx={{ color: '#00ff00' }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(45deg, #1a1a1a 30%, #2d2d2d 90%)',
        py: 8,
      }}
    >
      <Container maxWidth="md">
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
          Waiting Room
        </Typography>

        <StyledPaper>
          <Typography variant="h5" gutterBottom>
            Room Code: {room.roomCode}
          </Typography>

          {isHost && (
            <Typography variant="h6" gutterBottom>
              Host Pin: {hostPin}
            </Typography>
          )}

          {isHost ? (
            <>
              <Typography variant="h6" gutterBottom>
                Players ({room.players.length})
              </Typography>
              <PlayerList>
                {room.players.map((player) => (
                  <ListItem key={player._id}>
                    <ListItemText
                      primary={player.username}
                      sx={{ color: '#00ff00' }}
                    />
                  </ListItem>
                ))}
              </PlayerList>
            </>
          ) : null}

          {isHost && (
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <StyledButton
                variant="contained"
                onClick={handleStartQuiz}
                disabled={room.players.length === 0}
              >
                Start Quiz
              </StyledButton>
            </Box>
          )}

          {!isHost && (
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: '#00ff00' }}>
                Waiting for host to start the quiz...
              </Typography>
            </Box>
          )}
        </StyledPaper>
      </Container>
    </Box>
  );
};

export default WaitingRoom; 