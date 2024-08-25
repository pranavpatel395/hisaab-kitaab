const mongoose = require('mongoose')

const registerUserSchema = new mongoose.Schema({
  username:
  {
    type: String,
    required: true
  },

  name:
  {
    type: String,
    required: true
  },
  email:
  {
    type: String,
    required: true,
    unique: true
  },

  password:
  {
    type: String,
    required: true

  },
  conformpassword:
  {
    type: String,
    required: true

  }
});

module.exports = mongoose.model('user', registerUserSchema)