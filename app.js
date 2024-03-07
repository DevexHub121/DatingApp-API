const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv").config();
const cors = require("cors");
const connectDB = require("./db/conn");
const path = require("path");
const userRoutes = require("./routes/userRoutes");
const http = require("http");

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle messages
  socket.on("chat message", (msg) => {
    console.log("Got message", msg);
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json({ strict: false }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cors({ origin: "http://10.0.2.2:8000" }));
app.use("/api/user", userRoutes);

// Connect to the database and start the server
const start = async (uri) => {
  console.log("Starting ", uri);
  try {
    await connectDB(uri);
    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start(process.env.DATABASE);
