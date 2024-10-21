const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/configDB"); 

// Define the Blog model
const Blog = sequelize.define(
  "Blog",
  {
    blog_id: {
      type: DataTypes.STRING, 
      primaryKey: true,
      allowNull: false, 
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // Ensure this matches the actual table name
        key: 'id', // Assuming 'id' is the primary key in the Users table
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, 
    },
    content: {
      type: DataTypes.TEXT, 
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

// Export the Blog model
module.exports = Blog;
