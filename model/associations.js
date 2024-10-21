const Blog = require('./blogModel');
const User = require('./userModel');

// Define the associations
User.hasMany(Blog, { foreignKey: 'user_id' });
Blog.belongsTo(User, { foreignKey: 'user_id' });
