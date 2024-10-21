const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv')
const cors = require('cors');
const { connectToDatabase } = require('./config/configDB'); // Ensure the path is correct
const userRoutes = require('./routes/routes'); // Ensure the path is correct

const User = require('./model/userModel');
const Blog = require('./model/blogModel');
require('./model/associations'); // Import associations after models are defined


const app = express();
const PORT = process.env.PORT || 5000;
dotenv.config();


// Middleware to parse JSON
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

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
