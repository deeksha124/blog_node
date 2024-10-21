const { Sequelize } = require("sequelize");

const dbName = "user_blog";
const sequelize = new Sequelize(dbName, "postgres", "1234", {
    host: "localhost",
    dialect: "postgres",
});

// Function to create the database if it doesn't exist
const createDatabaseIfNotExists = async () => {
    const adminSequelize = new Sequelize("postgres", "postgres", "1234", {
        host: "localhost",
        dialect: "postgres",
        logging: false, // Disable logging for the admin connection
    });

    try {
        await adminSequelize.authenticate();
        console.log("Connected to PostgreSQL server successfully.");

        // Create the database if it doesn't exist
        await adminSequelize.query(`CREATE DATABASE "${dbName}";`);
        console.log(`Database "${dbName}" created successfully.`);
    } catch (error) {
        if (error.original && error.original.code === '42P04') {
            console.log(`Database "${dbName}" already exists.`);
        } else {
            console.error("Unable to create the database:", error);
        }
    } finally {
        await adminSequelize.close();
    }
};

// Function to connect to the database and sync models
const connectToDatabase = async () => {
    await createDatabaseIfNotExists();
    await sequelize.sync(); // This creates the user table based on the User model
};

module.exports = { sequelize, connectToDatabase };
