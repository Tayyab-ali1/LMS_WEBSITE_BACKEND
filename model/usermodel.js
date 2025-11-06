import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  password: {
    type: String,
    
  },
  role: {
    type: String,
    required: true,
    enum: ["student", "educator"],
  },
  photoUrl: {
    type: String,
    default: "",
  },
  enrollCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
  createdCourses: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },
],
  resetopt: {
    type: String,   // ✅ fixed
  },
  otpexpire: {
    type: Date,
  },
  isotpverified: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;
