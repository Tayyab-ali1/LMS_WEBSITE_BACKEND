import { uploadOnCloudinary } from "../config/cloudinary.js"
import Course from "../model/coursemodel.js"
import Lecture from "../model/leacturemodel.js"
import User from "../model/usermodel.js"



 export const createcourse =async(req,res)=>{
  try {
    const { title, category, description, level, price } = req.body;
    const userId = req.user; // from your auth middleware

    // 🧠 Validate input
    if (!title?.trim() || !category?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title and category are required.",
      });
    }
    console.log(userId)

    // 🧩 Validate user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 👮‍♂️ Only educators can create courses
    if (user.role !== "educator") {
      return res.status(403).json({
        success: false,
        message: "Only educators can create courses",
      });
    }

    // 🧑‍🏫 Create the course
    const course = await Course.create({
      title,
      category,
      description,
      level,
      price,
      creator: userId,
    });

    // ✅ Push course ID into user's createdCourses array
    user.createdCourses = user.createdCourses || [];
    user.createdCourses.push(course._id);
    await user.save();

    return res.status(201).json(course);
  } catch (error) {
    console.error("Error while creating course:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating course.",
      error: error.message,
    });
}
 }
 export const getpublishcourses=async(req,res)=>{
   try {
     const courses=await Course.find({ispublished:true}).populate("lectures reviews")
     if(!courses){
         return res.status(400).json({
             message:"courses not found "
         })
     }
     return res.status(202).json(courses)
   } catch (error) {
    return res.status(500).json({
        message:"server error while fetching courses"
    })
    console.log(error)
   }

}
 export const getcreatorcourses=async(req,res)=>{
   try {
     const userid=req.user
     const  courses=await Course.find({creator:userid})
     if(!courses){
          return res.status(400).json({
              message:"courses not found "
          })
      }
      return res.status(202).json(courses)
   } catch (error) {
     return res.status(500).json({
        message:"server error while fetching courses"
    })
    
   }

}
export const editCourse = async (req, res) => {
  try {
    const { courseid } = req.params;
    const { title, subtitle, description, category, level, ispublished, price } = req.body;

    // ✅ Find the course first
    const course = await Course.findById(courseid);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // ✅ Handle optional thumbnail upload
    let thumbnail = course.thumbnail; 
    console.log(req.file)// keep existing by default
    if (req.file) {
      console.log("REQ FILE:", req.file);
      const uploaded = await uploadOnCloudinary(req.file.path);
      console.log(uploaded)
      if (uploaded) {
        thumbnail = uploaded; // ✅ only overwrite if upload succeeds
      }
    }

    // ✅ Prepare update object (preserve existing if not provided)
    const updatedFields = {
      title: title ?? course.title,
      subtitle: subtitle ?? course.subtitle,
      description: description ?? course.description,
      category: category ?? course.category,
      level: level ?? course.level,
      ispublished: ispublished ?? course.ispublished,
      price: price ?? course.price,
      thumbnail, // ✅ always valid now
    };

    // ✅ Update course in DB
    const updatedCourse = await Course.findByIdAndUpdate(courseid, updatedFields, { new: true });

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      course: updatedCourse,
    });

  } catch (error) {
    console.error("Error updating course:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getCourse = async (req, res) => {
  try {
    const { courseid } = req.params;

    // ✅ Fetch course by ID
    const course = await Course.findById(courseid);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // ✅ Send successful response
    return res.status(200).json(
      course
    );

  } catch (error) {
    console.error("Error fetching course:", error);

    // ✅ Proper error handling
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
export const deleteCourse = async (req, res) => {
  try {
    const { courseid } = req.params;
    console.log(courseid)

    // ✅ Check if the course exists
    const course = await Course.findById(courseid);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // ✅ Delete the course
    const deletedCourse = await Course.findByIdAndDelete(courseid);

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
      course: deletedCourse,
    });

  } catch (error) {
    console.error("Error deleting course:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


// for leacture

export const createlecture = async (req, res) => {
  try {
    const { lectureTitle } = req.body;
    const { courseid } = req.params;

    if (!lectureTitle || !courseid) {
      return res.status(400).json({ message: "Lecture title and course ID are required" });
    }

    // ✅ Create a new lecture
    const lecture = await Lecture.create({ lectureTitle });

    // ✅ Find course and link lecture
    const course = await Course.findById(courseid);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    course.lectures.push(lecture._id);

    // ✅ Populate lectures and save without revalidating the whole schema
    await course.populate("lectures");
    await course.save({ validateBeforeSave: false }); // <--- key fix

    return res.status(201).json({ lecture, course });
  } catch (error) {
    console.error("Error creating lecture:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

 // ✅ make sure this is imported

export const getCreator = async (req, res) => {
  try {
    const { userId } = req.body;
    console.log( userId)

    if (!userId) {
      return res.status(400).json({ message: " ID is required" });
    }

    const user = await User.findById(userId);
console.log(user);
    

    if (!user) {
      return res.status(404).json({ message: "User not found " });
    }

    return res.status(200).json( user 
    );

  } catch (error) {
    console.error("Error finding creator:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching creator",
      error: error.message,
    });
  }
};





export const getcourselecture = async (req, res) => {
  try {
    const { courseid } = req.params;

    const course = await Course.findById(courseid);
    if (!course) {
      return res.status(401).json({ message: "Course not found" });
    }

    await course.populate("lectures");

    return res.status(200).json(course);
  } catch (error) {
    console.error("Error getting course lectures:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


export const editlecture =async (req,res)=>{
  try {
    const {lectureId}=req.params
    const {isPreviewFree, lectureTitle }=req.body
    console.log(isPreviewFree + lectureTitle)
    const lecture = await Lecture.findById(lectureId)
    if(!lecture){
      return res.status(404).json({message:"leacture is not found "})
    }
    let videoUrl
    if(req.file){
       videoUrl= await uploadOnCloudinary(req.file.path)
       lecture.videoUrl=videoUrl
    }
    if(lectureTitle){
      lecture.lectureTitle =lectureTitle
    }
    lecture.isPreviewFree=isPreviewFree

    await lecture.save()
    return res.status(200).json(lecture)
  } catch (error) {
     console.error("Error edit  leacture ", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

export const removelecture = async (req,res)=>{
  try {
    const {lectureId} =req.params
    console.log(lectureId)
    const lecture = await Lecture.findByIdAndDelete(lectureId)
    if (!lecture) {
      return res.status(400).json({message:"leacture not found "})
    }
    await Course.updateOne({lectures:lectureId},{
      $pull:{lectures:lectureId}
    })
    return res.status(200).json({message:"lecture remove successfully "})
  } catch (error) {

 console.error("Error remving  leacture ", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
    
  }
}