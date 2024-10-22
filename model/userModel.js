// const { DataTypes } = require("sequelize");
// const { sequelize } = require("../config/configDB"); 

// // Define the User model
// const User = sequelize.define(
//     "User",
//     {
//         id: {
//             type: DataTypes.INTEGER,
//             primaryKey: true,
//             autoIncrement: true,
//         },
//         name: {
//             type: DataTypes.STRING,
//             allowNull: false,
//         },
//         email: {
//             type: DataTypes.STRING,
//             unique: true,
//             allowNull: false,
//             validate: {
//                 isEmail: true, // Validate that the value is a valid email
//             },
//         },
//         phone: {
//             type: DataTypes.STRING,
//             unique: true,
//             allowNull: false,
//         },
//         password: {
//             type: DataTypes.STRING,
//             allowNull: false,
//         },
//     },
//     {
//         timestamps: true, // Automatically manage createdAt and updatedAt
//     }
// );

// // Export the User model
// module.exports = User;



const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/configDB"); 
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing

// Define the User model
const User = sequelize.define(
    "User",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
                isEmail: true, // Validate that the value is a valid email
            },
        },
        phone: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: { // Optional: Add a role field to distinguish admin users
            type: DataTypes.STRING,
            defaultValue: 'user', // Default role
        },
    },
    {
        timestamps: true, // Automatically manage createdAt and updatedAt
    }
);

// Function to create an admin user
const createAdminUser = async () => {
    const adminEmail = 'admin@example.com'; // Change this to your desired admin email
    const adminPassword = 'adminPassword'; // Change this to your desired admin password

    // Check if the admin user already exists
    const [adminUser, created] = await User.findOrCreate({
        where: { email: adminEmail },
        defaults: {
            name: 'Admin',
            phone: '1234567890', // Example phone number
            password: await bcrypt.hash(adminPassword, 10), // Hash the password
            role: 'admin', // Set role to admin
        },
    });

    console.log("adminUser----------------" , adminUser , "-------created" ,created)

    if (created) {
        console.log('Admin user created:', adminUser.email);
    } else {
        console.log('Admin user already exists:', adminUser.email);
    }
};

// Sync the model and create the admin user
User.sync({ alter: true }) // You can use { force: true } to drop and recreate the table if necessary
    .then(createAdminUser)
    .catch((error) => console.error('Error syncing User model:', error));

// Export the User model
module.exports = User;
