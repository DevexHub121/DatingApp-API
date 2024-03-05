const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv").config();
const app = express();
const cors = require("cors");
const connectDB = require("./db/conn");
const PORT = process.env.PORT || 5000;
const path = require("path");
const userRoutes = require("./routes/userRoutes");
const http = require("http").createServer(app); // Assuming 'app' is your Express instance
const io = require("socket.io")(http);
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

http.listen(3000, () => {
  console.log(`Server listening on port ${3000}`);
});

const allowedOrigins = [
  "http://127.0.0.1:5173",
  "http://localhost:19002",
  "http://localhost:3000",
];
// app.use(express.json());
app.use(express.json({ strict: false }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cors());
app.use("/api/user", userRoutes);

const start = async (uri) => {
  console.log("Starting ", uri);
  try {
    await connectDB(uri);
    app.listen(PORT, () => {
      console.log(`${PORT} yes i am connected`);
    });
  } catch (error) {
    console.log(error);
  }
};

start(process.env.DATABASE);
