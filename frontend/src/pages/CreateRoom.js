import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  IconButton,
  Card,
  CardContent,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import styled from 'styled-components';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const Sidebar = styled(Box)`
  width: 220px;
  min-height: 500px;
  background: #181818;
  border-right: 2px solid #00ff00;
  padding: 1rem 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const SidebarItem = styled(Button)`
  margin-bottom: 0.5rem !important;
  background: ${({ selected }) => (selected ? '#00ff00' : 'transparent')};
  color: ${({ selected }) => (selected ? '#181818' : '#00ff00')};
  border: 1px solid #00ff00;
  font-weight: bold;
  text-transform: none;
  &:hover {
    background: #00ff00;
    color: #181818;
  }
`;

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

const QuestionCard = styled(Card)`
  margin-bottom: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #00ff00;
`;

const timeOptions = [10, 15, 20, 25, 30, 40, 50, 60];
const correctOptions = [0, 1, 2, 3];

const CreateRoom = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([
    {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      timeLimit: 30,
      image: null,
    },
  ]);
  const [selectedQuestion, setSelectedQuestion] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [roomInfo, setRoomInfo] = useState({ roomCode: '', hostPin: '' });
  const [loading, setLoading] = useState(false);
  const [quizName, setQuizName] = useState('');

  const handleQuestionChange = (field, value) => {
    const newQuestions = [...questions];
    newQuestions[selectedQuestion][field] = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[selectedQuestion].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const handleImageChange = (file) => {
    const newQuestions = [...questions];
    newQuestions[selectedQuestion].image = file;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        timeLimit: 30,
        image: null,
      },
    ]);
    setSelectedQuestion(questions.length);
  };

  const removeQuestion = (index) => {
    if (questions.length === 1) return;
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
    setSelectedQuestion(Math.max(0, index - 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Get host username from JWT token
      const token = localStorage.getItem('token');
      let hostUsername = '';
      if (token) {
        const decoded = jwtDecode(token);
        hostUsername = decoded.username;
      }
      // Create room
      const roomResponse = await axios.post('http://localhost:5000/api/rooms/create', {
        hostUsername,
        quizName,
      });
      const { room, hostPin } = roomResponse.data;
      setRoomInfo({ roomCode: room.roomCode, hostPin });
      setDialogOpen(true);
      // Upload all questions
      await Promise.all(
        questions.map(async (question) => {
          const formData = new FormData();
          formData.append('question', question.question);
          formData.append('options', JSON.stringify(question.options));
          formData.append('correctAnswer', question.correctAnswer);
          formData.append('timeLimit', question.timeLimit);
          if (question.image) {
            formData.append('image', question.image);
          }
          await axios.post(`http://localhost:5000/api/questions/${room._id}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        })
      );
      // After dialog closes, navigate to waiting room
      setLoading(false);
      // Navigation will be handled after dialog closes
      // navigate(`/waiting-room/${room._id}`, { state: { roomCode: room.roomCode, hostPin } });
    } catch (error) {
      setLoading(false);
      console.error('Error creating room:', error);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    // Navigate to waiting room after dialog closes
    navigate(`/waiting-room/${roomInfo.roomCode}`, {
      state: { roomCode: roomInfo.roomCode, hostPin: roomInfo.hostPin },
    });
  };

  const q = questions[selectedQuestion];

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(45deg, #1a1a1a 30%, #2d2d2d 90%)', py: 8 }}>
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ textAlign: 'center', color: '#00ff00', textShadow: '0 0 10px rgba(0, 255, 0, 0.5)', mb: 4 }}
        >
          Create Quiz Room
        </Typography>
        <TextField
          fullWidth
          label="Quiz Name"
          value={quizName}
          onChange={(e) => setQuizName(e.target.value)}
          variant="outlined"
          sx={{ mb: 3 }}
        />
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Sidebar */}
          <Sidebar>
            <Typography variant="h6" sx={{ color: '#00ff00', mb: 2, textAlign: 'center' }}>Questions</Typography>
            {questions.map((question, idx) => (
              <SidebarItem
                key={idx}
                selected={selectedQuestion === idx}
                onClick={() => setSelectedQuestion(idx)}
                fullWidth
              >
                {question.question ? `Q${idx + 1}: ${question.question.slice(0, 10)}...` : `Question ${idx + 1}`}
              </SidebarItem>
            ))}
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addQuestion}
              sx={{ mt: 2, color: '#00ff00', borderColor: '#00ff00' }}
              fullWidth
            >
              Add Question
            </Button>
          </Sidebar>
          {/* Main Content */}
          <Box sx={{ flex: 1 }}>
            <StyledPaper>
              <QuestionCard>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Question"
                        value={q.question}
                        onChange={(e) => handleQuestionChange('question', e.target.value)}
                        variant="outlined"
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    {q.options.map((option, optionIndex) => (
                      <Grid item xs={12} sm={6} key={optionIndex}>
                        <TextField
                          fullWidth
                          label={`Option ${optionIndex + 1}`}
                          value={option}
                          onChange={(e) => handleOptionChange(optionIndex, e.target.value)}
                          variant="outlined"
                        />
                      </Grid>
                    ))}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        label="Correct Answer"
                        value={q.correctAnswer}
                        onChange={(e) => handleQuestionChange('correctAnswer', Number(e.target.value))}
                        variant="outlined"
                        sx={{ mb: 2 }}
                      >
                        {correctOptions.map((opt) => (
                          <MenuItem key={opt} value={opt}>{`Option ${opt + 1}`}</MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        label="Time Limit (seconds)"
                        value={q.timeLimit}
                        onChange={(e) => handleQuestionChange('timeLimit', Number(e.target.value))}
                        variant="outlined"
                        sx={{ mb: 2 }}
                      >
                        {timeOptions.map((t) => (
                          <MenuItem key={t} value={t}>{t} seconds</MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e.target.files[0])}
                        style={{ display: 'none' }}
                        id={`image-upload-${selectedQuestion}`}
                      />
                      <label htmlFor={`image-upload-${selectedQuestion}`}>
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<AddIcon />}
                          sx={{ color: '#00ff00', borderColor: '#00ff00' }}
                        >
                          Add Image
                        </Button>
                        {q.image && (
                          <Typography variant="caption" sx={{ color: '#00ff00', ml: 2 }}>
                            {q.image.name}
                          </Typography>
                        )}
                      </label>
                    </Grid>
                    {questions.length > 1 && (
                      <Grid item xs={12}>
                        <IconButton color="error" onClick={() => removeQuestion(selectedQuestion)}>
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </QuestionCard>
              <Box sx={{ mt: 2, mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <StyledButton variant="contained" onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Creating...' : 'Create Quiz'}
                </StyledButton>
              </Box>
            </StyledPaper>
          </Box>
        </Box>
        {/* Room Info Dialog */}
        <Dialog open={dialogOpen} onClose={handleDialogClose}>
          <DialogTitle>Room Created!</DialogTitle>
          <DialogContent>
            <Typography>Room Code: <b>{roomInfo.roomCode}</b></Typography>
            <Typography>Host Pin: <b>{roomInfo.hostPin}</b></Typography>
            <Typography sx={{ mt: 2, color: '#00ff00' }}>Share these with your players!</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} variant="contained" color="success">
              Go to Waiting Room
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default CreateRoom; 