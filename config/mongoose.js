const mongoose = require('mongoose');
const debuglog = require('debug')("development:mongooseconfig");
require('dotenv').config();  // Load environment variables from .env file

const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/registerdb';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', function (error) {
  debuglog('MongoDB connection error:', error);
});

db.once('open', function () {
  debuglog('MongoDB connection successful');
});
