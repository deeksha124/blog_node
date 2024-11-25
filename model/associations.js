const Blog = require("./blogModel");
const User = require("./userModel");
const Comment = require("./commentModel");
const Like = require("./likeModel"); // Import Like model

// Define User-Blog relationship
User.hasMany(Blog, { foreignKey: "user_id" });
Blog.belongsTo(User, { foreignKey: "user_id" });

// Define User-Comment relationship
User.hasMany(Comment, { foreignKey: "user_id" });
Comment.belongsTo(User, { foreignKey: "user_id" });

// Define Blog-Comment relationship
Blog.hasMany(Comment, { foreignKey: "blog_id", as: "comments" });
Comment.belongsTo(Blog, { foreignKey: "blog_id" });

// Define Blog-Like relationship
Blog.hasMany(Like, { foreignKey: "blog_id", as: "likes" }); // A blog can have many likes
Like.belongsTo(Blog, { foreignKey: "blog_id" }); // A like belongs to a specific blog

// Define User-Like relationship
User.hasMany(Like, { foreignKey: "user_id" });
Like.belongsTo(User, { foreignKey: "user_id" });

Comment.hasMany(Comment, { foreignKey: "parent_id", as: "replies" });
Comment.belongsTo(Comment, { foreignKey: "parent_id", as: "parent" });

module.exports = { User, Blog, Comment, Like };
