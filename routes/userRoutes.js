const express = require("express");
const router = express.Router();
const multer = require("multer");
const { authenticateToken } = require("../middleware/middleware");
const {
  registerUser,
  loginUser,
  profileData,
  uploadProfileFile,
  getImages,
  profileProfileData,
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
  videoCallToken,
} = require("../controllers/auth/userController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop();
    cb(null, `profile-${Date.now()}.${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 10,
  },
});

router.post("/upload", upload.single("image"), uploadImage);
router.post("/signup", registerUser);
router.post("/signin", loginUser);
router.get("/profile", authenticateToken, profileData);
router.patch("/update-profile", authenticateToken, updateProfileData);
router.get("/getUsers", authenticateToken, getAllUsers);
router.post("/likeUser", authenticateToken, likeUser);
router.get("/getNotification", authenticateToken, getNotificationsByUserId);
router.delete(
  "/deleteNotification/:notificationId",
  authenticateToken,
  deleteNotification
);
router.post("/send-message", authenticateToken, postMessage);
router.get("/messages", authenticateToken, getMessageBySenderReceiver);
router.get("/messageReceivers", authenticateToken, getMessageReceiversBySender);
router.delete("/delete-account", authenticateToken, deleteUserAccount);
router.post("/stream-chat/token", authenticateToken, videoCallToken);

module.exports = router;
