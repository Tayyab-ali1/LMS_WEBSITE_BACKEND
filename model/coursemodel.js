import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
  },
  description: {
    type: String, // ✅ Capital "S"
  },
  level: {
    type: String, // ✅ Capital "S"
    enum: ["beginner", "intermediate", "advanced"],
     default: "beginner", // ✅ Fixed spelling
  },
  thumbnail: { // ✅ Fixed spelling from "thumnail"
    type: String,
  },
  category:{
  type:String,
  required:true
  },
  price: {
    type: Number,
    
  },
  enrolledStudents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ], // ✅ Changed to array (usually multiple students enroll)
  lectures: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture",
    },
  ], // ✅ Changed to array (a course usually has multiple lectures)
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }, // ✅ Fixed spelling from "creater"
  ispublished: {
    type: Boolean,
    default: false,
  }, // ✅ Fixed naming style
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ], // ✅ Usually multiple reviews
}, { timestamps: true });

const Course = mongoose.model("Course", courseSchema);

export default Course;
