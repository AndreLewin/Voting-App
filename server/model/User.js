const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    password: { type: String, required: true } //TODO: Use bcrypt
  }
);

const User = mongoose.model('User', schema, 'users');

module.exports = User;