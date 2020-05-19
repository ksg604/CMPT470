const User = require('../models/user');
const mongoose = require('mongoose');
const Review = require('./review.js');

const BusinessSchema = new mongoose.Schema({
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
  add1 : {
    type: String,
    required: true
  },
  add2 : {
    type: String,
    required: false
  },
  city : {
    type: String,
    required: true
  },
  state : {
    type: String,
    required: true
  },
  zip : {
    type: String,
    required: true
  },
  country : {
    type: String,
    required: true
  },
  radius : {
    type: Number,
    required: true
  },
  openingHour : {
    type: String,
    required: true
  },
  closingHour : {
    type: String,
    required: true
  },
  m : {
    type: Boolean,
    required: true
  },
  tu : {
    type: Boolean,
    required: true
  },
  w : {
    type: Boolean,
    required: true
  },
  th : {
    type: Boolean,
    required: true
  },
  fr : {
    type: Boolean,
    required: true
  },
  sa : {
    type: Boolean,
    required: true
  },
  su : {
    type: Boolean,
    required: true
  },
  queue : {
    type: Number,
    required: true
  },
  coordinates : {
    type: [Number],
    required: true
  },
  date : {
    type: Date,
    default: Date.now
  },

  reviews : {
    type: [Review.schema]
  },
  queueList : [{ _id: false, id: { type: mongoose.ObjectId, ref: 'User'}, name: {type: String } }],
  serveList : [{ _id: false, id: { type: mongoose.ObjectId, ref: 'User'}, name: {type: String } }]

});

const Business = mongoose.model('Buisness', BusinessSchema);
module.exports = Business;
