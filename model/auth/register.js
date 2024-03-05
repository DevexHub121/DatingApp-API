const { default: mongoose } = require("mongoose");
const registerSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please add an email"],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
  },
  name: {
    type: String,
    required: [true, "Please add a username"],
  },
  phone: {
    type: String,
    required: [true, "Please add a phone"],
  },
  city: {
    type: String,
    required: [true, "Please add a city"],
  },
  country: {
    type: String,
    required: [true, "Please add a country"],
  },
  distance: {
    type: String,
    required: [true, "Please add a distance"],
  },
  dob: {
    type: String,
    required: [false, "Please add a dob"],
  },
  gender: {
    type: String,
    required: [true, "Please add a gender"],
  },
  habits1: {
    type: Array,
    required: [true, "Please add a habits"],
  },
  habits2: {
    type: Array,
    required: [true, "Please add a habits"],
  },
  hobbies: {
    type: String,
    required: [true, "Please add a hobbies"],
  },
  interests: {
    type: String,
    required: [true, "Please add a interests"],
  },
  allInterests: {
    type: String,
    required: [false, "Please add a allInterests"],
  },
  location: {
    type: mongoose.Schema.Types.Mixed,
    required: [false, "Please add a location"],
  },
  partnerType: {
    type: String,
    required: [false, "Please add a partner type"],
  },
  profilePic: {
    type: String,
    required: [true, "Please add a profile pic"],
  },

  education: {
    type: String,
    required: [false, "Please add a education"],
  },
  language: {
    type: String,
    required: [false, "Please add a language"],
  },
  ageRange: {
    type: String,
    required: [false, "Please add age range"],
  },
  work: {
    type: String,
    required: [false, "Please add work"],
  },
  profilePercentage: {
    type: String,
    required: [false, "Please add profile percentage"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
  height: {
    type: String,
    required: [false, "Please add height"],
  },
  likedBy: {
    type: Array,
    required: [false, "No Likes"],
  },
});

module.exports = mongoose.model("Register", registerSchema);
