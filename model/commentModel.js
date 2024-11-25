// const { DataTypes } = require("sequelize");
// const { sequelize } = require("../config/configDB");
// const { v4: uuidv4 } = require("uuid"); // UUID v4 for generating unique IDs

// const Comment = sequelize.define(
//   "Comment",
//   {
//     comment_id: {
//       type: DataTypes.UUID,
//       defaultValue: uuidv4, // Use UUID v4 to generate unique IDs
//       primaryKey: true,
//     },
//     user_id: {
//       type: DataTypes.INTEGER, // Assuming user_id is an integer
//       allowNull: false,
//       references: {
//         model: "Users", // Ensure this matches the User table name
//         key: "id", // Assumes 'id' is the primary key in the Users table
//       },
//     },
//     username: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     blog_id: {
//       type: DataTypes.STRING, // Assuming blog_id is a string
//       allowNull: false,
//       references: {
//         model: "Blogs", // Ensure this matches the Blog table name
//         key: "blog_id", // Assumes 'blog_id' is the primary key in the Blogs table
//       },
//     },
//     comment: {
//       type: DataTypes.TEXT,
//       allowNull: false,
//     },
//   },
//   {
//     timestamps: true, // Automatically manages createdAt and updatedAt
//   }
// );
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/configDB");
const { v4: uuidv4 } = require("uuid");

const Comment = sequelize.define(
  "Comment",
  {
    comment_id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users", // Reference Users table
        key: "id",
      },
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    blog_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "Blogs", // Reference Blogs table
        key: "blog_id",
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    parent_id: {
      type: DataTypes.UUID, // Reference same table
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

// Define associations after model definition
Comment.associate = (models) => {
  Comment.hasMany(models.Comment, { foreignKey: "parent_id", as: "replies" });
  Comment.belongsTo(models.Comment, { foreignKey: "parent_id", as: "parent" });
};

module.exports = Comment;
