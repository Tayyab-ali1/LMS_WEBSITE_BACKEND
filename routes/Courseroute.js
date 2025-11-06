import { Router } from "express";
import { verifyjwt } from "../middleware/jwtverify.js";
import {
  createcourse,
  createlecture,
  deleteCourse,
  editCourse,
  editlecture,
  getCourse,
  getcourselecture,
  getCreator,
  getcreatorcourses,
  getpublishcourses,
  removelecture,
} from "../controller/Course.js";
import upload from "../middleware/multer.js";
import { searchai } from "../controller/searchcontroller.js";

const courserouter = Router();

// ✅ Create course (requires authentication)
courserouter.post("/create", verifyjwt, createcourse);

// ✅ Get single course by ID (public)
courserouter.get("/getcourse/:courseid", getCourse);

// ✅ Delete course (requires authentication)
courserouter.delete("/deletecourse/:courseid", verifyjwt, deleteCourse);

// ✅ Get all courses created by logged-in user
courserouter.get("/getcreator", verifyjwt, getcreatorcourses);

// ✅ Edit course (PUT method and correct field name)
courserouter.post("/editcourse/:courseid", verifyjwt, upload.single("thumbnail"), editCourse);

// ✅ Get all published courses (public)
courserouter.get("/getpublishedcourse", getpublishcourses);
courserouter.post("/creator",verifyjwt,getCreator)
// for lecture 
courserouter.post("/createlecture/:courseid", verifyjwt ,createlecture)
courserouter.get("/courselecture/:courseid",verifyjwt,getcourselecture)
courserouter.post("/editlecture/:lectureId",verifyjwt,upload.single("videoUrl"),editlecture)
courserouter.delete("/removelecture/:lectureId",verifyjwt ,removelecture )
courserouter.post("/search",searchai)

export default courserouter;
