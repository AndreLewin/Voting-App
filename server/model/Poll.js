const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    user_id: { type: String, required: true },
    question: { type: String, required: true }
  }
);

const Poll = mongoose.model('Poll', schema, 'polls');

module.exports = Poll;