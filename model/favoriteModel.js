const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/configDB");

const Favorite = sequelize.define(
  "Favorite",
  {
    favorite_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true, // Enable auto-increment
      primaryKey: true, // Set as the primary key
    },
    user_id: {
      type: DataTypes.INTEGER, // Assuming user_id is an integer
      allowNull: false,
    },
    blog_id: {
      type: DataTypes.STRING, // Assuming blog_id is a string
      allowNull: false,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);
module.exports = Favorite;
