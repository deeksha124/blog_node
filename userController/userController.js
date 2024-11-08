// const userModel = require("../model/userModel");
const bcrypt = require("bcrypt");
const User = require("../model/userModel");
const Blog = require("../model/blogModel");
const jwt = require("jsonwebtoken");
const { user } = require("pg/lib/defaults");
const { successResponse, errorResponse } = require("../utils/response");

exports.createUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check for existing user by email
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      // return res.status(400).json({ message: "Email already exists" });
      return errorResponse(res, "Email already exists", 400);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // Create a new user in the database
    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    console.log("newUser", newUser);
    let data = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
    };

    // Generate JWT token
    const token = jwt.sign(
      { id: data.id, email: existingUser.email }, // Payload
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const response = {
      code: 0,
      error: false,
      message: "You are signed up successfully",
      token,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return errorResponse(res, "Error occurred", 500);
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for existing user by email
    const existingUser = await User.findOne({ where: { email } });
    console.log("existingUser----", existingUser);

    if (existingUser) {
      const hashedPassword = existingUser.dataValues.password;
      console.log("hashedPassword-------", hashedPassword);
      const matchPassword = await bcrypt.compare(password, hashedPassword);
      if (matchPassword) {
        // Generate JWT token
        const token = jwt.sign(
          { id: existingUser.id, email: existingUser.email }, // Payload
          process.env.JWT_SECRET,
          { expiresIn: "24h" }
        );
        const response = {
          code: 0,
          error: false,
          message: "You are login successfully",
          token: token,
        };

        res.status(200).json(response);
      } else {
        errorResponse(res, "Wrong Password", 400);
      }
    } else {
      errorResponse(res, "User not found", 400);
    }
  } catch (error) {
    console.log(error);
    errorResponse(res, "Error occurred", 500);
  }
};

exports.dashboard = async (req, res) => {
  try {
    const user_id = req.userId;
    console.log("user_id-----", user_id);

    const user = await User.findOne({ where: { id: user_id } });
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    // Fetch the count of blogs for the user
    const blogCount = await Blog.count({ where: { user_id: user_id } });

    // Fetch a list of blogs for the user (limit to 10 for simplicity)
    const blogs = await Blog.findAll({
      where: { user_id: user_id },
      limit: 10, // Adjust limit as needed
      order: [["createdAt", "DESC"]], // Order by most recent blogs
    });

    // Base URL for the images
    const baseUrl = process.env.BASE_URL || "http://192.168.8.237:5000"; // Fallback URL if BASE_URL is not defined

    // Loop through each blog to construct the image URL if it exists
    blogs.forEach((blog) => {
      if (blog.dataValues.image) {
        // Construct the image URL
        blog.dataValues.image = `${baseUrl}/${blog.dataValues.image}`;
      }
    });

    // Prepare the response data
    const data = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      blogCount, // Number of blogs the user has
      blogs, // List of blogs with updated image URLs
    };

    // Prepare response object
    const response = {
      code: 0,
      error: false,
      message: "Dashboard data fetched successfully",
      data,
    };

    // Return the response
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return errorResponse(
      res,
      "Error occurred while fetching dashboard data",
      500
    );
  }
};

exports.adminDashboard = async (req, res) => {
  try {
    const user_id = req.userId;
    if (user_id == 1) {
      const user = await User.findOne({ where: { id: user_id } });
      if (!user) {
        return errorResponse(res, "User not found", 404);
      }
    }

    // Fetch the count of blogs for the user
    const userCount = await User.count();

    // Fetch a list of blogs for the user (limit to 10 for simplicity)
    const blogs = await Blog.findAll({
      limit: 10, // Adjust limit as needed
      order: [["createdAt", "DESC"]], // Order by most recent blogs
    });

    // Base URL for the images
    const baseUrl = process.env.BASE_URL || "http://192.168.8.237:5000"; // Fallback URL if BASE_URL is not defined

    // Loop through each blog to construct the image URL if it exists
    blogs.forEach((blog) => {
      if (blog.dataValues.image) {
        // Construct the image URL
        blog.dataValues.image = `${baseUrl}/${blog.dataValues.image}`;
      }
    });

    // Prepare the response data
    const data = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      userCount, // Number of blogs the user has
      blogs, // List of blogs with updated image URLs
    };

    // Prepare response object
    const response = {
      code: 0,
      error: false,
      message: "Dashboard data fetched successfully",
      data,
    };

    // Return the response
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return errorResponse(
      res,
      "Error occurred while fetching dashboard data",
      500
    );
  }
};

exports.homePage = async (req, res) => {
  try {
    // Fetch the count of users
    const userCount = await User.count();

    const page = parseInt(req.query.page, 10) || 1; // Default to page 1
    const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 items per page
    const offset = (page - 1) * limit;
    console.log("limit-->", limit, "offset-->", offset);

    // Fetch blogs with pagination
    const { count, rows: blogs } = await Blog.findAndCountAll({
      limit, // Limit the number of results
      offset, // Skip the number of records based on current page
      order: [["createdAt", "DESC"]], // Order by most recent blogs
    });

    // Calculate the total number of pages
    const totalPages = Math.ceil(count / limit);

    // Modify image URL for each blog if the image exists
    if (blogs && blogs.length > 0) {
      const baseUrl = process.env.BASE_URL || "http://192.168.8.237:5000";
      blogs.forEach((blog) => {
        if (blog.image) {
          blog.image = `${baseUrl}/${blog.image}`;
        }
      });
    }

    // Prepare data object
    const data = { userCount, blogs, totalPages, currentPage: page };

    // Send success response
    return successResponse(
      res,
      "Home page data fetched successfully",
      200,
      data
    );
  } catch (error) {
    console.error(error);

    // Send error response in case of failure
    return errorResponse(
      res,
      "Error occurred while fetching home page data",
      500
    );
  }
};
