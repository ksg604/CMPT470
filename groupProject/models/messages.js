const mongoose = require('mongoose');
var ChatMessageSchema = new mongoose.Schema({
  senderName : {
    type: String,
    required: true
  },
  msg : {
    type: String,
    required: true
  },
});

var MessageHistorySchema = new mongoose.Schema({
  roomName : {
    type: String,
    required: true
  },
  messages: [ChatMessageSchema]
});

const ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema);
const MessageHistory = mongoose.model('MessageHistory', MessageHistorySchema);
module.exports = { ChatMessage, MessageHistory };

