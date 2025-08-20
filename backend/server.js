const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
const Room = require('./models/Room');
const Question = require('./models/Question');
const User = require('./models/User');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.set('io', io); // Expose io instance for routes

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://23csea06bavakarnig:fLh1FEQ7iqGmDTG5@cluster0.39smckc.mongodb.net/quizstorage', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Real-time quiz state
const quizState = {};

// Socket.IO Connection
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('joinRoom', async ({ roomId, userId }) => {
    socket.join(roomId);
    // Optionally, store userId in socket for answer tracking
    socket.data = { roomId, userId };
  });

  socket.on('startGame', async ({ roomId }) => {
    // Fetch room and questions
    const room = await Room.findOne({ $or: [ { _id: roomId }, { roomCode: roomId } ] }).populate('questions');
    if (!room || !room.questions.length) return;
    
    // Initialize quiz state
    quizState[roomId] = {
      current: 0,
      answers: {}, // { questionId: { userId: { answer, time, isCorrect, score } } }
      scores: {}, // { userId: totalScore }
      questionStart: null,
      questions: room.questions
    };

    // Emit gameStarted event to all clients in the room
    io.in(roomId).emit('gameStarted');
    
    // Add a small delay before sending the first question to ensure all clients are ready
    setTimeout(() => {
      sendQuestion(roomId);
    }, 1000);
  });

  socket.on('submitAnswer', async ({ roomId, userId, questionId, selectedOption, timeTaken }) => {
    const state = quizState[roomId];
    if (!state) return;
    if (!state.answers[questionId]) state.answers[questionId] = {};
    // Prevent double answer
    if (state.answers[questionId][userId]) return;
    // Fetch question
    const question = await Question.findById(questionId);
    const isCorrect = selectedOption === question.correctAnswer;
    // New scoring logic: correct = 10 + time left, wrong = 0
    const timeLeft = question.timeLimit - timeTaken;
    let score = 0;
    if (isCorrect) {
      score = 10 + Math.max(timeLeft, 0); // Ensure no negative bonus
    } else {
      score = 0;
    }
    state.answers[questionId][userId] = { answer: selectedOption, time: timeTaken, isCorrect, score };
    if (!state.scores[userId]) state.scores[userId] = 0;
    state.scores[userId] += score;
    // Only update DB if userId is a valid ObjectId (i.e., a real player)
    if (mongoose.Types.ObjectId.isValid(userId)) {
      await User.findByIdAndUpdate(userId, {
        $inc: { score: score },
        $push: {
          answers: {
            question: question._id,
            selectedOption,
            isCorrect,
            timeTaken
          }
        }
      });
    }
    // Notify this user of result
    io.to(socket.id).emit('answerResult', { isCorrect, correctAnswer: question.correctAnswer });
  });

  socket.on('nextQuestion', ({ roomId }) => {
    sendQuestion(roomId);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

async function sendQuestion(roomId) {
  const state = quizState[roomId];
  if (!state) return;
  
  if (state.current >= state.questions.length) {
    // Quiz ended
    // Fetch player usernames for leaderboard
    const userIds = Object.keys(state.scores);
    const users = await User.find({ _id: { $in: userIds } });
    const leaderboard = users.map(u => ({ 
      username: u.username, 
      score: state.scores[u._id] || 0 
    }));
    leaderboard.sort((a, b) => b.score - a.score);
    
    // Emit quizEnded event to all clients in the room
    io.in(roomId).emit('quizEnded', { leaderboard });
    
    // Update room status to completed
    await Room.findByIdAndUpdate(roomId, { status: 'completed' });
    
    // Clean up quiz state
    delete quizState[roomId];
    return;
  }

  const question = state.questions[state.current];
  state.questionStart = Date.now();
  
  // Send question to all clients in the room
  io.in(roomId).emit('nextQuestion', {
    _id: question._id,
    question: question.question,
    options: question.options,
    imageUrl: question.imageUrl,
    timeLimit: question.timeLimit,
    number: state.current + 1,
    total: state.questions.length
  });

  // Move to next question after timeLimit
  setTimeout(() => {
    state.current++;
    sendQuestion(roomId);
  }, question.timeLimit * 1000);
}

// Routes
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/users', require('./routes/users'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 