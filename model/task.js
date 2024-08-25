const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  title: String,
  content: String,
  userId: { type: Schema.Types.ObjectId, ref: 'registerUser' }, // Reference to the User
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', taskSchema);
