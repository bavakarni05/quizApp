import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
} from '@mui/material';
import styled from 'styled-components';
import io from 'socket.io-client';
//comment
const StyledPaper = styled(Paper)`
  padding: 2rem;
  background: linear-gradient(45deg, #2d2d2d 30%, #1a1a1a 90%);
  border: 2px solid #00ff00;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
`;

const OptionButton = styled(Button)`
  width: 100%;
  padding: 1rem;
  margin: 0.5rem 0;
  background: rgba(0, 255, 0, 0.1);
  border: 2px solid #00ff00;
  color: #00ff00;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 255, 0, 0.2);
    transform: scale(1.02);
  }

  &.selected {
    background: rgba(0, 255, 0, 0.3);
  }

  &.correct {
    background: rgba(0, 255, 0, 0.4);
  }

  &.incorrect {
    background: rgba(255, 0, 0, 0.4);
  }
`;

const Timer = styled(Box)`
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid #00ff00;
  border-radius: 4px;
  color: #00ff00;
`;

const SOCKET_URL = 'http://localhost:5000';

const QuizRoom = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isHost, playerId } = location.state || {};
  const userId = isHost ? 'host' : playerId; // Use a dummy id for host
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState(null); // {isCorrect, correctAnswer}
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(1);
  const socketRef = useRef();
  const timerRef = useRef();

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    // Join the room for real-time events
    socket.emit('joinRoom', { roomId, userId });

    socket.on('nextQuestion', (question) => {
      setCurrentQuestion(question);
      setTimeLeft(question.timeLimit);
      setSelectedOption(null);
      setAnswered(false);
      setAnswerFeedback(null);
      setQuestionNumber(question.number || 1);
      setTotalQuestions(question.total || 1);
    });

    socket.on('answerResult', (result) => {
      setAnswerFeedback(result);
    });

    socket.on('quizEnded', (data) => {
      setLeaderboard(data.leaderboard);
      setShowLeaderboard(true);
    });

    return () => {
      socket.disconnect();
      clearInterval(timerRef.current);
    };
  }, [roomId, userId]);

  useEffect(() => {
    if (currentQuestion && timeLeft > 0 && !answered) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timerRef.current);
    } else if (timeLeft === 0 && currentQuestion && !answered) {
      handleAnswer(-1); // Time's up
    }
  }, [timeLeft, answered, currentQuestion]);

  const handleAnswer = (optionIndex) => {
    if (answered || !currentQuestion) return;
    setSelectedOption(optionIndex);
    setAnswered(true);
    // Send answer to backend (except for host)
    if (!isHost && currentQuestion._id && playerId) {
      socketRef.current.emit('submitAnswer', {
        roomId,
        userId: playerId,
        questionId: currentQuestion._id,
        selectedOption: optionIndex,
        timeTaken: currentQuestion.timeLimit - timeLeft,
      });
    }
  };

  if (showLeaderboard) {
    return (
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(45deg, #1a1a1a 30%, #2d2d2d 90%)', py: 8 }}>
        <Container maxWidth="md">
          <Typography variant="h3" sx={{ color: '#00ff00', textAlign: 'center', mb: 4 }}>Leaderboard</Typography>
          <StyledPaper>
            {leaderboard.map((entry, idx) => (
              <Typography key={idx} variant="h5" sx={{ color: idx === 0 ? '#ffd700' : '#00ff00', mb: 2 }}>
                {idx + 1}. {entry.username} - {entry.score} pts
              </Typography>
            ))}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button variant="contained" color="success" onClick={() => navigate('/')}>Back to Home</Button>
            </Box>
          </StyledPaper>
        </Container>
      </Box>
    );
  }

  if (!currentQuestion) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(45deg, #1a1a1a 30%, #2d2d2d 90%)' }}>
        <CircularProgress sx={{ color: '#00ff00' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(45deg, #1a1a1a 30%, #2d2d2d 90%)', py: 8, position: 'relative' }}>
      <Container maxWidth="md">
        <Timer>
          <Typography variant="h6">{timeLeft}s</Typography>
        </Timer>
        <Typography variant="h3" component="h1" gutterBottom sx={{ textAlign: 'center', color: '#00ff00', textShadow: '0 0 10px rgba(0, 255, 0, 0.5)', mb: 4 }}>
          Question {questionNumber} / {totalQuestions}
        </Typography>
        <StyledPaper>
          <Card sx={{ mb: 4, background: 'transparent' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ color: '#00ff00' }}>
                {currentQuestion.question}
              </Typography>
              {currentQuestion.imageUrl && (
                <CardMedia component="img" image={currentQuestion.imageUrl} alt="Question" sx={{ maxHeight: 300, objectFit: 'contain', mb: 2 }} />
              )}
            </CardContent>
          </Card>
          {!isHost && (
            <Grid container spacing={2}>
              {currentQuestion.options.map((option, index) => {
                let btnClass = '';
                if (answered && selectedOption === index) {
                  if (answerFeedback) {
                    btnClass = answerFeedback.isCorrect && answerFeedback.correctAnswer === index ? 'correct' : 'incorrect';
                  } else if (currentQuestion.correctAnswer === index) {
                    btnClass = 'correct';
                  }
                } else if (answered && answerFeedback && answerFeedback.correctAnswer === index) {
                  btnClass = 'correct';
                }
                return (
                  <Grid item xs={12} sm={6} key={index}>
                    <OptionButton
                      variant="outlined"
                      onClick={() => handleAnswer(index)}
                      className={
                        selectedOption === index ? 'selected ' + btnClass : btnClass
                      }
                      disabled={answered}
                    >
                      {option}
                    </OptionButton>
                  </Grid>
                );
              })}
            </Grid>
          )}
          {isHost && (
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: '#00ff00' }}>
                Waiting for players to answer...
              </Typography>
            </Box>
          )}
        </StyledPaper>
      </Container>
    </Box>
  );
};

export default QuizRoom;
