const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    poll_id: { type: String, required: true },
    response: { type: String, required: true }
  }
);

const Choice = mongoose.model('Choice', schema, 'choices');

module.exports = Choice;