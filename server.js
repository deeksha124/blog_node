const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { connectToDatabase } = require("./config/configDB"); // Ensure the path is correct
const userRoutes = require("./routes/routes"); // Ensure the path is correct
const path = require("path");

global.basedir = __dirname + "/";

const app = express();
const PORT = process.env.PORT || 5000;
dotenv.config();

// Import models and associations
const User = require("./model/userModel");
const Blog = require("./model/blogModel");
const Like = require("./model/likeModel");
const Favorite = require("./model/favoriteModel");
require("./model/associations"); // Import associations after models are defined

// Whitelist IPs
const whitelist = [
  "http://localhost",
  "http://127.0.0.1",
  "http://192.168.8.237",
  "::1",
  "::ffff:192.168.8.237",
];

// CORS configuration delegate
const corsOptionsDelegate = (req, callback) => {
  const corsOptions = {
    methods: ["GET", "PUT", "POST", "DELETE", "HEAD", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Allow cookies (if needed)
  };

  // Get the client's IP address
  const clientIp =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  // Check if the client's IP is in the whitelist
  if (whitelist.includes(clientIp)) {
    corsOptions.origin = true; // Allow the request
  } else {
    corsOptions.origin = false; // Reject the request
    console.log(`Request from IP ${clientIp} rejected`);
  }

  // Call the callback with the options
  callback(null, corsOptions);
};

// Use the CORS middleware with the custom options
app.use(cors(corsOptionsDelegate));

// Middleware for parsing incoming requests
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files from the 'uploads' directory
app.use(express.static(path.join(__dirname, "uploads"))); // Correct static file path

// User routes
app.use("/v1", userRoutes);

const startServer = async () => {
  try {
    await connectToDatabase(); // Connect to DB and create tables if needed
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
  }
};

// Start the server
startServer();
