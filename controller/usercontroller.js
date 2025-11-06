import { uploadOnCloudinary } from "../config/cloudinary.js";
import sendmail from "../config/sendmail.js";
import User from "../model/usermodel.js";
import apiresponse from "../utils/apiresponse.js";
import bcrypt from "bcryptjs";

// ----------------- GET CURRENT USER -----------------
export const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json(new apiresponse(200, { user }, "Fetched user detail successfully"));
  } catch (error) {
    console.error("❌ getCurrentUser error:", error);
    res.status(500).json({ message: "Server error while fetching user detail" });
  }
};

// ----------------- SEND OTP -----------------
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    user.resetopt = otp;
    user.otpexpire = Date.now() + 5 * 60 * 1000; // 5 minutes
    user.isotpverified = false;
    await user.save();

    await sendmail(email, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully. Please check your email.",
    });
  } catch (error) {
    console.error("❌ sendOtp error:", error);
    return res.status(500).json({ message: "Error occurred while sending OTP" });
  }
};

// ----------------- VERIFY OTP -----------------
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log(email,otp)
    const user = await User.findOne({ email });

    if (!user || user.resetopt !== otp || user.otpexpire < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.resetopt = undefined;
    user.otpexpire = undefined;
    user.isotpverified = true;
    await user.save();

    return res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("❌ verifyOtp error:", error);
    return res.status(500).json({ message: "Verify OTP server error" });
  }
};

// ----------------- RESET PASSWORD -----------------
export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.isotpverified) {
      return res.status(400).json({ message: "OTP verification is required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    user.isotpverified = false; // reset flag
    user.password = await bcrypt.hash(password, 10);

    await user.save();

    return res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("❌ resetPassword error:", error);
    return res.status(500).json({ message: "Reset password error" });
  }
};

//-------------------- UPDATE PROFILE --------------



export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, description } = req.body;

    let photoUrl;
    if (req.file) {
      photoUrl = await uploadOnCloudinary(req.file.path); // ✅ need await
    }

    const updateData = { name, description };
    if (photoUrl) updateData.photoUrl = photoUrl;

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Update profile error:", error.message);
    return res.status(500).json({
      message: "Something went wrong while updating profile",
    });
  }
};
