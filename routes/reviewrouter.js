import { Router } from "express";
import { verifyjwt } from "../middleware/jwtverify.js";
import { coursereview, getreview } from "../controller/reviewcontroller.js";


const reviewrouter =Router()


reviewrouter.post("/createreview",verifyjwt,coursereview)
reviewrouter.get("/getreview",getreview)


export default reviewrouter