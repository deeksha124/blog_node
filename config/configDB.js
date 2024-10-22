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



// const { Sequelize } = require("sequelize");

// // Initial connection to the default PostgreSQL database
// const sequelize = new Sequelize("postgres", "postgres", "1234", {
//     host: "localhost",
//     dialect: "postgres",
// });

// // Function to connect to the user_blog database
// const connectToDatabase = async () => {
//     try {
//         // Authenticate with the default database (postgres)
//         await sequelize.authenticate();
//         console.log("Connection to the default database has been established successfully.");

//         // Create the user_blog database if it doesn't exist
//         await sequelize.query(`CREATE DATABASE "user_blog"`);
//         console.log("Database 'user_blog' has been created successfully.");
//     } catch (error) {
//         if (error.original && error.original.code === '42P04') {
//             console.log("Database 'user_blog' already exists.");
//         } else {
//             console.error("Unable to connect to the database:", error);
//             return; // Exit if there's an error
//         }
//     }

//     // Now, connect to the user_blog database
//     const userBlogDb = new Sequelize("user_blog", "postgres", "1234", {
//         host: "localhost",
//         dialect: "postgres",
//     });

//     // Test the connection to user_blog database
//     try {
//         await userBlogDb.authenticate();
//         console.log("Connection to the 'user_blog' database has been established successfully.");

//         // Synchronize models with the database
//         await userBlogDb.sync(); // This will create tables if they don't exist
//         console.log("All models have been synchronized successfully.");
//     } catch (error) {
//         console.error("Unable to connect to the 'user_blog' database:", error);
//     }
// };

// // Export the sequelize instance and connect function
// module.exports = { sequelize, connectToDatabase };
