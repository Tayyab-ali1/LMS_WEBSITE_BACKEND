import User from "../model/usermodel.js";
import apierror from "../utils/apierror.js";
import jwt from "jsonwebtoken";

export const verifyjwt = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    

    if (!token) {
      return res.status(400).json({
        messgae:"token  not avalible"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded?._id).select("-password");

    if (!user) { 
        return res.status(400).json({
        messgae:"invalid token "
      });;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error verifying token:", error.message);
    return res.status(error.statusCode || 401).json({
      success: false,
      message: error.message || "Unauthorized",
    });
  }
};
