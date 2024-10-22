// const userModel = require("../model/userModel");
const bcrypt = require("bcrypt");
const User = require("../model/userModel");
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

    const response = {
      code: 0,
      error: false,
      message: "You are signed up successfully",
      data,
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
          { expiresIn: "1h" }
        );
        const response = {
          code: 0,
          error: false,
          message: "You are login successfully",
          Token : token
        };
 
         res.status(200).json(response)
      } else {
        errorResponse(res ,"Wrong Password" , 400 )
      }
    } else {
      errorResponse(res,"User not found" ,400)
    }
  } catch (error) {
    console.log(error);
    errorResponse(res, "Error occurred", 500)
  }
};
