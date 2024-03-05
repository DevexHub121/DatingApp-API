const jwt = require("jsonwebtoken");

const verifyToken = (token) => {
  const secretKey = process.env.JWT_SECRET;
  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded.user; // Assuming you stored user information in the token
  } catch (error) {
    throw new Error("Invalid token");
  }
};

// Middleware to check authorization token
const authenticateToken = (req, res, next) => {
  console.log("Authent ", req.headers["authorization"]);
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.slice(7);
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const user = verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = { authenticateToken };
