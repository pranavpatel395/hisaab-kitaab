const mongoose = require('mongoose')

const registerUserSchema = new mongoose.Schema({
  username:
  {
    type: String,
    required: true
  },
  password:
  {
    type: String,
    required: true

  }
});

module.exports = mongoose.model('user', registerUserSchema)