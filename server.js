const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectToDatabase } = require('./config/configDB'); // Ensure the path is correct
const userRoutes = require('./routes/routes'); // Ensure the path is correct

const User = require('./model/userModel');
const Blog = require('./model/blogModel');
require('./model/associations'); // Import associations after models are defined

const app = express();
const PORT = process.env.PORT || 5000;
dotenv.config();

// Middleware to parse JSON and extend payload size
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Set limit for JSON payloads
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Set limit for URL-encoded payloads
app.use(bodyParser.json({ limit: '10mb' })); // Optional: additional body parser limit

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

startServer();
