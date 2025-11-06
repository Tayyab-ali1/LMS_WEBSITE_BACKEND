import User from "../model/usermodel.js";
import bcrypt from "bcryptjs";
import validator from "validator";
import { genToken } from "../utils/Generatetoken.js";

import apiresponse from "../utils/apiresponse.js";

// ----------------- COOKIE CONFIG -----------------
const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none" ,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// ----------------- REGISTER -----------------
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json(new apiresponse(400, {}, "All fields are required"));
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json(new apiresponse(400, {}, "Enter a valid email"));
    }

    // Check if user already exists
    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json(new apiresponse(400, {}, "User already exists"));
    }

    // Check password strength
    if (password.length < 8) {
      return res.status(400).json(new apiresponse(400, {}, "Password must be at least 8 characters long"));
    }

    // Hash password
    const saltRounds = Number(process.env.SALT_NUMBER) || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const createdUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // Get user without password
    const user = await User.findById(createdUser._id).select("-password");

    // Generate token
    const token = genToken(user._id);

    // Set cookie
    res.cookie("token", token, cookieOptions);

    return res.status(201).json(new apiresponse(201, user, "User created successfully"));
  } catch (error) {
    console.error("❌ Error in register route:", error);
    return res
      .status(error.statusCode || 500)
      .json(new apiresponse(error.statusCode || 500, {}, error.message || "Internal Server Error"));
  }
};

// ----------------- LOGIN -----------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!validator.isEmail(email)) {
      return res.status(400).json(new apiresponse(400, {}, "Enter a valid email"));
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json(new apiresponse(400, {}, "User does not exist"));
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json(new apiresponse(400, {}, "Incorrect email or password"));
    }

    user.password = undefined;

    const token = genToken(user._id);

    res.cookie("token", token, cookieOptions);

    return res.status(200).json(new apiresponse(200, user, "User logged in successfully"));
  } catch (error) {
    console.error("❌ Error in login route:", error);
    return res
      .status(error.statusCode || 500)
      .json(new apiresponse(error.statusCode || 500, {}, error.message || "Internal Server Error"));
  }
};

// ----------------- LOGOUT -----------------
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", cookieOptions);

    return res.status(200).json(new apiresponse(200, {}, "User logged out successfully"));
  } catch (error) {
    console.error("❌ Error in logout route:", error);
    return res
      .status(500)
      .json(new apiresponse(500, {}, error.message || "Internal Server Error"));
  }
};

// ----------------- GOOGLE AUTH -----------------
export const googleauth = async (req, res) => {
  try {
    const { email, name, role } = req.body;

    // Validate input
    if (!email || !name) {
      return res.status(400).json(new apiresponse(400, {}, "Name and email are required"));
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // If user does not exist, create one
      if (!role) {
        return res.status(400).json(new apiresponse(400, {}, "Role is required for registration"));
      }

      user = await User.create({
        name,
        email,
        password: "", // Google users don’t need password
        role,
      });
    }

    // Exclude password
    user = await User.findById(user._id).select("-password");

    // Generate JWT token
    const token = genToken(user._id);

    // Set cookie
    res.cookie("token", token, cookieOptions);

    return res.status(200).json(new apiresponse(200, user, "Google authentication successful"));
  } catch (error) {
    console.error("❌ Error in googleauth route:", error);
    return res
      .status(error.statusCode || 500)
      .json(new apiresponse(error.statusCode || 500, {}, error.message || "Internal Server Error"));
  }
};
