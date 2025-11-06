import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config({ path: "./.env" });

export const uploadOnCloudinary = async (filePath) => {
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API, 
    api_secret: process.env.CLOUD_API_SECRET,
  });

  try {
    if (!filePath) {
      return null;
    }

    const uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });

    // safely remove file
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error("Failed to delete local file:", err.message);
    }

    return uploadResult.secure_url;
  } catch (error) {
    // delete file if something goes wrong
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error("Failed to delete local file:", err.message);
    }

    console.error("Cloudinary upload error:", error.message);
    return null;
  }
};
