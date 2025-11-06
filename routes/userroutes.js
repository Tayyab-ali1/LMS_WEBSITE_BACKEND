import { Router } from "express";
import { verifyjwt } from "../middleware/jwtverify.js";
import { 
  getCurrentUser, 
  resetPassword, 

  sendOtp,
  updateProfile,
  verifyOtp, 

  // ✅ fixed naming
} from "../controller/usercontroller.js";
import upload from "../middleware/multer.js";

const 
userrouter = Router();

// ✅ Protected route
userrouter.get("/getuserdetail", verifyjwt, getCurrentUser);

// ✅ OTP routes
userrouter.post("/getotp",sendOtp);
userrouter.post("/verifyotp", verifyOtp);

// ✅ Reset password
userrouter.post("/resetpassword", resetPassword);
userrouter.post("/updateprofile",verifyjwt,upload.single("photoUrl"),updateProfile)

export default userrouter;
