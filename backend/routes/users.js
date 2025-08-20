const express = require('express');
const router = express.Router();
const User = require('../models/User');
const AuthUser = require('../models/AuthUser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Get user by ID
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user score
router.patch('/:userId/score', async (req, res) => {
  try {
    const { score } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $inc: { score: score } },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's answers
router.get('/:userId/answers', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('answers.question');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.answers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user's current room
router.patch('/:userId/room', async (req, res) => {
  try {
    const { roomId } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { currentRoom: roomId },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Signup endpoint
router.post('/signup', async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const existingAuthUser = await AuthUser.findOne({ username, role });
    if (existingAuthUser) {
      return res.status(400).json({ message: 'Username already exists for this role' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const authUser = new AuthUser({ username, password: hashedPassword, role });
    await authUser.save();
    // Also create a User document for game data if not exists
    let user = await User.findOne({ username });
    if (!user) {
      user = new User({ username });
      await user.save();
    }
    const token = jwt.sign({ id: authUser._id, role: authUser.role, username: authUser.username }, 'your_jwt_secret', { expiresIn: '7d' });
    res.json({ message: 'Signup successful', token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const authUser = await AuthUser.findOne({ username, role });
    if (!authUser) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }
    const isMatch = await bcrypt.compare(password, authUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }
    const token = jwt.sign({ id: authUser._id, role: authUser.role, username: authUser.username }, 'your_jwt_secret', { expiresIn: '7d' });
    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 