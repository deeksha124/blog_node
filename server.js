
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectToDatabase } = require('./config/configDB'); // Ensure the path is correct
const userRoutes = require('./routes/routes'); // Ensure the path is correct
const path = require('path')

global.basedir = __dirname +"/" ;

const app = express();
const PORT = process.env.PORT || 5000;
dotenv.config();

// Import models and associations
const User = require('./model/userModel');
const Blog = require('./model/blogModel');
require('./model/associations'); // Import associations after models are defined

// CORS configuration
const whitelist = ['http://localhost', 'http://127.0.0.1', 'http://192.168.8.237'];
const corsOptionsDelegate = (req, callback) => {
    const corsOptions = {
        methods: ["GET", "PUT", "POST", "DELETE", "HEAD", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true
    };

    const myIpAddress = req.connection.remoteAddress;

    // Check if the IP is in the whitelist
    if (whitelist.includes(myIpAddress)) {
        corsOptions.origin = true; // Allow the request
    } else {
        corsOptions.origin = false; // Reject the request
        console.log("Requesting getting  Rejected")
    }
    callback(null, corsOptions);
};

// Middleware
// app.use(cors(corsOptionsDelegate));
app.use(cors())
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' })); // Optional: additional body parser limit


// Serve static files from the 'uploads' directory
// app.use('/blog-writing/blog_node/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static("uploads"));

// User routes
app.use('/v1', userRoutes);

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
