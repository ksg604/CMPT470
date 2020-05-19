const Business = require('../models/business');
const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  name : {
    type: String,
    required: true
  },
  email : {
    type: String,
    required: true
  },
  password : {
    type: String,
    required: true
  },
  currentRestraunt: {
    type: mongoose.ObjectId,
    ref: 'Business',
    default: null
  },
  date : {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
