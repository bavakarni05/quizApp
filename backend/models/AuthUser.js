const mongoose = require('mongoose');

const authUserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['host', 'player'], required: true }
});

authUserSchema.index({ username: 1, role: 1 }, { unique: true });

module.exports = mongoose.model('AuthUser', authUserSchema); 