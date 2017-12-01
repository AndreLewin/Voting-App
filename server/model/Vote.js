const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    ip_hash: { type: String, required: true },
    choice_id: { type: String, required: true }
  }
);

const Vote = mongoose.model('Vote', schema, 'votes');

module.exports = Vote;