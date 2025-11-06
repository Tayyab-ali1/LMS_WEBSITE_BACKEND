import { Router } from "express";
import { googleauth, login, logout, register } from "../controller/Authcontroller.js";
import { verifyjwt } from "../middleware/jwtverify.js";

const router = Router();

// Register
router.post("/register", register);

// Login
router.post("/login", login);

// Logout (better as POST, since it changes server state)
router.get("/logout", verifyjwt, logout);

router.post("/google",googleauth
    
)

export default router;
