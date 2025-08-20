const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const Room = require('../models/Room');
const multer = require('multer');
const path = require('path');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Add a question to a room
router.post('/:roomId', upload.single('image'), async (req, res) => {
  try {
    const { question, options, correctAnswer, timeLimit } = req.body;
    const roomId = req.params.roomId;

    const newQuestion = new Question({
      question,
      options: JSON.parse(options),
      correctAnswer: parseInt(correctAnswer),
      timeLimit: parseInt(timeLimit),
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
      room: roomId
    });

    await newQuestion.save();

    // Add question to room
    await Room.findByIdAndUpdate(roomId, {
      $push: { questions: newQuestion._id }
    });

    res.json(newQuestion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all questions for a room
router.get('/room/:roomId', async (req, res) => {
  try {
    const questions = await Question.find({ room: req.params.roomId });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit answer
router.post('/:questionId/answer', async (req, res) => {
  try {
    const { userId, selectedOption, timeTaken } = req.body;
    const question = await Question.findById(req.params.questionId);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const isCorrect = selectedOption === question.correctAnswer;

    // Update user's answer and score
    await User.findByIdAndUpdate(userId, {
      $push: {
        answers: {
          question: question._id,
          selectedOption,
          isCorrect,
          timeTaken
        }
      },
      $inc: { score: isCorrect ? 1 : 0 }
    });

    res.json({ isCorrect });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 