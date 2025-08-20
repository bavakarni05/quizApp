const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { io } = require('../server');

// Create a new room
router.post('/create', async (req, res) => {
  try {
    const { hostUsername, quizName } = req.body;
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const hostPin = Math.random().toString(36).substring(2, 6).toUpperCase();

    // Find the host user by username
    const hostUser = await User.findOne({ username: hostUsername });
    if (!hostUser) {
      return res.status(404).json({ message: 'Host user not found' });
    }

    const room = new Room({
      quizName,
      roomCode,
      hostPin,
      host: hostUser._id,
      status: 'waiting',
      players: [hostUser._id]
    });

    await room.save();

    // Update host's current room
    await User.findByIdAndUpdate(hostUser._id, { currentRoom: room._id });

    res.json({ room, hostPin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Join room as host
router.post('/join/host', async (req, res) => {
  try {
    const { roomCode, hostPin } = req.body;
    const room = await Room.findOne({ roomCode, hostPin });

    if (!room) {
      return res.status(404).json({ message: 'Invalid room code or host pin' });
    }

    // Remove all player users associated with this room
    await User.deleteMany({ currentRoom: room._id, role: 'player' });

    // Clear the players array in the room
    room.players = [];
    await room.save();

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Join room as player
router.post('/join/player', async (req, res) => {
  console.log('POST /api/rooms/join/player called with:', req.body);
  try {
    const { roomCode, username } = req.body;
    const room = await Room.findOne({ roomCode: roomCode.trim() });

    if (!room) {
      console.log('Room not found for code:', roomCode);
      return res.status(404).json({ message: 'Room not found with the provided code.' });
    }

    if (room.status !== 'waiting') {
      return res.status(400).json({ message: 'Room is not accepting players' });
    }

    // Prevent duplicate usernames in the same room
    const existingPlayerInRoom = await User.findOne({ username, currentRoom: room._id });
    if (existingPlayerInRoom) {
      return res.status(400).json({ message: 'Username already taken in this room' });
    }

    // Try to find the main User document for this player
    let player = await User.findOne({ username, role: 'player' });
    if (!player) {
      // If not found, create a new User
      player = new User({
        username,
        role: 'player',
        score: 0,
        answers: []
      });
      await player.save();
    }

    // Set currentRoom and add to room's players if not already present
    player.currentRoom = room._id;
    await player.save();
    if (!room.players.includes(player._id)) {
      room.players.push(player._id);
      await room.save();
    }

    // Emit playerJoined event to all in the room
    if (req.app.get('io')) {
      const updatedRoom = await Room.findById(room._id).populate('players');
      req.app.get('io').in(room._id.toString()).emit('playerJoined', updatedRoom);
    }

    res.json({ room, player });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start quiz
router.post('/:roomId/start', async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    room.status = 'active';
    await room.save();

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get room details (by ObjectId or roomCode)
router.get('/:roomId', async (req, res) => {
  try {
    let room;
    if (mongoose.Types.ObjectId.isValid(req.params.roomId)) {
      room = await Room.findById(req.params.roomId)
        .populate('host')
        .populate('players')
        .populate('questions');
    }
    if (!room) {
      // Try to find by roomCode
      room = await Room.findOne({ roomCode: req.params.roomId })
        .populate('host')
        .populate('players')
        .populate('questions');
    }
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all rooms created by a host (by username)
router.get('/host/:username', async (req, res) => {
  try {
    const { username } = req.params;
    // Find the user document for the host
    const hostUser = await User.findOne({ username });
    if (!hostUser) {
      return res.status(404).json({ message: 'Host not found' });
    }
    // Find rooms where host matches this user's _id
    const rooms = await Room.find({ host: hostUser._id }).populate('players').populate('questions');
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all rooms joined by a player (by username)
router.get('/player/:username', async (req, res) => {
  try {
    const { username } = req.params;
    // Find the user document for the player
    const playerUser = await User.findOne({ username });
    if (!playerUser) {
      return res.status(404).json({ message: 'Player not found' });
    }
    // Find rooms where players array includes this user's _id
    const rooms = await Room.find({ players: playerUser._id }).populate('host').populate('questions');
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 