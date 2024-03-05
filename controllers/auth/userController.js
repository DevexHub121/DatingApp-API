const UserRegister = require("../../model/auth/register");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const UserLogin = require("../../model/auth/login");
const Notification = require("../../model/notification/notification");
const ChatMessage = require("../../model/chats/chats");
const { StreamChat } = require("stream-chat");

const fs = require("fs");

// generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const registerUser = async (req, res, next) => {
  try {
    const {
      email,
      password,
      city,
      country,
      distance,
      dob,
      gender,
      habits1,
      habits2,
      hobbies,
      interests,
      location,
      name,
      partnerType,
      phone,
      profilePic,
    } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please add all fields" });
    }

    const userExists = await UserRegister.findOne({ email });
    if (userExists) {
      res.status(400).json({ success: false, message: "User already exists" });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      //  const hashedConfirmPassword = await bcrypt.hash(confirmPassword, 10);
      const newUser = new UserRegister({
        email,
        password: hashedPassword,
        city,
        country,
        distance,
        dob,
        gender,
        habits1,
        habits2,
        hobbies,
        interests,
        location,
        name,
        partnerType,
        phone,
        profilePic,
      });
      const user = await newUser.save();
      if (user) {
        return res
          .status(200)
          .json({ success: true, message: "User Registered Successfully" });
      } else {
        res
          .status(400)
          .json({ success: true, message: "something went Wrong" });
        throw new Error("Invalid user data");
      }
    }
  } catch (error) {
    console.log("error: " + error);
    next(error);
    res.status(500).json({ success: true, message: "Internal Server Error" });
  }
};

const loginUser = async (req, res, next) => {
  console.log("req.body", req.body);
  try {
    console.log("Called");
    const { email, password } = req.body;
    const user = await UserRegister.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      console.log("First step true");

      res.status(200).json({
        data: user,
        _id: user._id,
        token: generateToken(user._id),
        message: "Login successful",
      });
    } else {
      console.log("Second step true");
      res.status(400).json({ message: "Invalid credentials" }); // Respond with 400 for invalid credentials
    }
  } catch (error) {
    next(error);
    res.status(500).json({ message: "Server error" });
  }
};

const profileData = async (req, res, next) => {
  console.log("hiiiii ", req.query);
  try {
    const id = req.query.id;
    const user = await UserRegister.findById(id);
    if (user) {
      res.status(200).json({
        data: user,
      });
    } else {
      res.status(400).json({ message: "invalid credentails" });
    }
  } catch (error) {
    next(error);
  }
};

const uploadProfileFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const imagePath = req.file.path.replace(/\\/g, "/");
    const imageUrl = req.protocol + "://" + req.get("host") + "/" + imagePath;
    const { filename, path } = req.file;
    res.status(200).json({ filename, path, imageUrl, status: 200 });
  } catch (error) {
    res.status(400).json({ error: error.message }); // Send error message as object
  }
};

const getAllUsers = async (req, res, next) => {
  console.log("idddddd", req.query);
  try {
    const userId = req.query.id;
    const users = await UserRegister.find(
      { _id: { $ne: userId } },
      {
        profilePic: 1,
        name: 1,
        location: 1,
        hobbies: 1,
        distance: 1,
        habits1: 1,
      }
    );

    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
};

const getImages = async (req, res, next) => {
  const data = await UserRegister.findOne({ _id: req.params.id });
  if (data.profileFile !== "") {
    const images = fs.readFileSync(`uploads/${data?.profileFile}`, "base64");
    res.status(200).json({ images });
  } else {
    res.status(200).json(data);
  }
};

const updateProfileData = async (req, res, next) => {
  console.log("req.body ", req.body);
  try {
    const id = req.body.id._j;
    const field = req.body.field;
    const value = req.body.value;
    const user = await UserRegister.findById(id);
    if (user) {
      user[field] = value;
      user.save();
      res
        .status(200)
        .json({ message: "field updated successfully ", status: 200 });
    } else {
      res.status(400).json({ message: "some thing went wrong!" });
    }
  } catch (error) {
    next(error);
  }
};

const likeUserProfile = async (likerId, userIdBeingLiked) => {
  try {
    // Find the user being liked
    const userBeingLiked = await UserRegister.findById(userIdBeingLiked);

    // Check if the user being liked exists
    if (!userBeingLiked) {
      throw new Error("User being liked not found");
    }

    // Check if the liker's ID is already present in the likedBy array
    if (userBeingLiked.likedBy.includes(likerId)) {
      return { success: false, message: "User already liked this profile" };
    }

    // Update the likedBy array of the user being liked
    userBeingLiked.likedBy.push(likerId);

    // Save the updated user document
    await userBeingLiked.save();

    return { success: true, message: "User liked successfully" };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const createNotification = async (recipientUserId, senderUserId, type) => {
  try {
    const notification = new Notification({
      recipientUserId,
      senderUserId,
      type,
    });
    await notification.save();
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

// Express route to handle liking a user's profile
const likeUser = async (req, res, next) => {
  try {
    console.log("req.body", req.body);
    const { likerId, userIdBeingLiked } = req.body;

    // Call the service to like the user's profile
    const result = await likeUserProfile(likerId, userIdBeingLiked);
    await createNotification(userIdBeingLiked, likerId, "like");

    if (result.success) {
      res
        .status(200)
        .json({ success: true, message: "User liked successfully" });
    } else {
      res.status(400).json({ success: false, message: result.error });
    }
  } catch (error) {
    next(error);
  }
};

const getNotificationsByUserId = async (req, res, next) => {
  try {
    const userId = req.query.id; // Assuming the user ID is passed as a parameter
    const notifications = await Notification.find({ recipientUserId: userId });
    res.status(200).json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    console.log("Deleting notification", req.params.notificationId);
    const notificationId = req.params.notificationId;

    // Find the notification by ID and delete it
    await Notification.findByIdAndDelete(notificationId);

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const postMessage = async (req, res) => {
  try {
    console.log(req.body);
    const { senderId, receiverId, message } = req.body;
    const newMessage = new ChatMessage({
      sender: senderId,
      receiver: receiverId,
      message,
    });
    await newMessage.save();
    res.status(201).send(newMessage);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Route to get all chat messages
const getMessageBySenderReceiver = async (req, res) => {
  try {
    console.log(req.query);
    const { senderId, receiverId } = req.query;
    const messagesSentByUser1ToUser2 = await ChatMessage.find({
      sender: senderId,
      receiver: receiverId,
    });

    res.status(200).json({ messages: messagesSentByUser1ToUser2 });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const getMessageReceiversBySender = async (req, res) => {
  try {
    const { senderId } = req.query;

    // Find all unique receiver IDs for messages sent by the given sender
    const uniqueReceiverIds = await ChatMessage.distinct("receiver", {
      sender: senderId, // Messages sent by the given sender
    });

    // Additional condition for messages where the sender is the receiver of another sender
    const otherSenderReceiverIds = await ChatMessage.distinct("sender", {
      receiver: senderId,
    });

    // Combine unique receiver IDs from both queries
    const allReceiverIds = [...uniqueReceiverIds, ...otherSenderReceiverIds];

    // Define a set to store unique sender-receiver pairs
    const uniqueSenderReceiverPairs = new Set();

    // Define an array to store the latest message details for each receiver
    const latestMessages = [];

    // Iterate over each unique receiver ID
    for (const receiverId of allReceiverIds) {
      // Find the latest message exchanged between sender and receiver
      const latestMessage = await ChatMessage.findOne(
        {
          $or: [
            // For messages sent by the given sender and received by the current receiver
            { sender: senderId, receiver: receiverId },
            // For messages sent by the current receiver and received by the given sender
            { sender: receiverId, receiver: senderId },
          ],
        },
        {},
        { sort: { timestamp: -1 } } // Sort by timestamp in descending order to get the latest message
      );

      // Check if the sender-receiver pair is unique
      const senderReceiverPair = `${latestMessage.sender}-${latestMessage.receiver}`;
      if (!uniqueSenderReceiverPairs.has(senderReceiverPair)) {
        // Add the sender-receiver pair to the set
        uniqueSenderReceiverPairs.add(senderReceiverPair);

        // Add the receiver ID and latest message details to the array
        if (latestMessage) {
          latestMessages.push({
            receiverId: receiverId,
            latestMessage: latestMessage.message,
            latestMessageTimestamp: latestMessage.timestamp,
            // Also include the sender ID
            senderId: latestMessage.sender,
          });
        }
      }
    }

    console.log("Msgs", latestMessages);
    res.status(200).json({ receivers: latestMessages });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const uploadImage = async (req, res) => {
  try {
    console.log(req.file);

    const imagePath = req.file.path.replace(/\\/g, "/");

    const imageUrl = `${req.protocol}://${req.get("host")}/${imagePath}`;
    console.log("imageUrl", imageUrl);

    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteUserAccount = async (req, res) => {
  try {
    const { userId } = req.query;

    await UserRegister.findByIdAndDelete(userId);

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const videoCallToken = async (req, res) => {
  console.log("This is token", req.body);
  const api_key = "tgmn64zvvytf";
  const api_secret =
    "g82zyp829ushh8vf9pyjsnuz5p28qbfvypbtbxkqva5eawfqj8tjpy4pcmga7q3g";
  const user_id = req.body.id;
  const serverClient = StreamChat.getInstance(api_key, api_secret);
  // Create User Token
  const token = serverClient.createToken(user_id);
  res.json({ token });
};

module.exports = {
  registerUser,
  loginUser,
  profileData,
  uploadProfileFile,
  getImages,
  videoCallToken,
  updateProfileData,
  getAllUsers,
  likeUser,
  uploadImage,
  getNotificationsByUserId,
  deleteNotification,
  postMessage,
  getMessageBySenderReceiver,
  getMessageReceiversBySender,
  deleteUserAccount,
};
