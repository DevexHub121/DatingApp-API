const mongoose = require("mongoose");

// Define ChatMessage Schema
const chatMessageSchema = new mongoose.Schema({
  sender: {
    type: String, // Assuming sender is a string, but you can adjust the type as needed
    required: true,
  },
  receiver: {
    type: String, // Assuming receiver is also a string
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Create ChatMessage model
const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);

module.exports = ChatMessage;
