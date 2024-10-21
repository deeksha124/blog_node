const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/configDB"); 

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
    },
    {
        timestamps: true, // Automatically manage createdAt and updatedAt
    }
);

// Export the User model
module.exports = User;
