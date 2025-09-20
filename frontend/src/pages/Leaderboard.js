import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  CircularProgress,
} from '@mui/material';
import styled from 'styled-components';
import axios from 'axios';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
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

const Leaderboard = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await axios.get(`https://quizzverse-cv88.onrender.com/api/rooms/${roomId}`);
        setRoom(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching room:', error);
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  if (loading) {
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

  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);

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
          Leaderboard
        </Typography>

        <StyledPaper>
          <PlayerList>
            {sortedPlayers.map((player, index) => (
              <ListItem
                key={player._id}
                sx={{
                  background:
                    index === 0
                      ? 'linear-gradient(45deg, #ffd700 30%, #ffa500 90%)'
                      : index === 1
                      ? 'linear-gradient(45deg, #c0c0c0 30%, #a9a9a9 90%)'
                      : index === 2
                      ? 'linear-gradient(45deg, #cd7f32 30%, #8b4513 90%)'
                      : 'transparent',
                  mb: 1,
                  borderRadius: 1,
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor:
                        index === 0
                          ? '#ffd700'
                          : index === 1
                          ? '#c0c0c0'
                          : index === 2
                          ? '#cd7f32'
                          : '#00ff00',
                    }}
                  >
                    {index < 3 ? (
                      <EmojiEventsIcon />
                    ) : (
                      <Typography>{index + 1}</Typography>
                    )}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={player.username}
                  secondary={`Score: ${player.score}`}
                  primaryTypographyProps={{
                    sx: {
                      color: index < 3 ? '#000' : '#00ff00',
                      fontWeight: 'bold',
                    },
                  }}
                  secondaryTypographyProps={{
                    sx: {
                      color: index < 3 ? '#000' : '#00ff00',
                    },
                  }}
                />
              </ListItem>
            ))}
          </PlayerList>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <StyledButton
              variant="contained"
              onClick={() => navigate('/')}
            >
              Back to Home
            </StyledButton>
          </Box>
        </StyledPaper>
        {room.questions && room.questions.length > 0 && (
          <QuestionsWithAnswers questions={room.questions} />
        )}
      </Container>
    </Box>
  );
};

// Helper to render questions and correct answers
function QuestionsWithAnswers({ questions }) {
  return (
    <Box sx={{ mt: 6 }}>
      <Typography variant="h4" sx={{ color: '#00ff00', mb: 2 }}>
        Questions & Correct Answers
      </Typography>
      {questions.map((q, idx) => (
        <Paper key={q._id || idx} sx={{ p: 2, mb: 2, background: 'rgba(0,0,0,0.5)' }}>
          <Typography variant="h6" sx={{ color: '#00ff00' }}>{`Q${idx + 1}: ${q.question}`}</Typography>
          <Box sx={{ ml: 2, mt: 1 }}>
            {q.options.map((opt, i) => (
              <Typography
                key={i}
                sx={{
                  color: i === q.correctAnswer ? '#00ff00' : '#fff',
                  fontWeight: i === q.correctAnswer ? 'bold' : 'normal',
                  mb: 0.5
                }}
              >
                {String.fromCharCode(65 + i)}. {opt}
                {i === q.correctAnswer && ' (Correct)'}
              </Typography>
            ))}
          </Box>
        </Paper>
      ))}
    </Box>
  );
}

export default Leaderboard; 