import mongoose from "mongoose";
const connectDB = async () => {
    

  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("✅ Database successfully connected");
  } catch (error) {
    console.error("❌ Error while connecting to DB:", error.message);
    process.exit(1); // Exit the app if DB fails
  }
};



 export default connectDB