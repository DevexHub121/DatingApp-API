const mongoose = require("mongoose");

// Define Notification Schema
const notificationSchema = new mongoose.Schema({
  recipientUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  senderUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  type: {
    type: String,
    enum: ["like", "comment", "follow"], // Example notification types
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
});

// Create Notification model
const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
