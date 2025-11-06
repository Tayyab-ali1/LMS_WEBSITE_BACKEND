import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

// ✅ Load env variables first
dotenv.config({ path: "./.env" });


const app = express();
const port = process.env.PORT || 8000;


import connectDB from "./config/connectdb.js";
connectDB()
// ✅ CORS (allow localhost + another laptop in same Wi-Fi)
app.use(cors({
  origin: [
    "http://localhost:5173", 
    "http://localhost:5174",
    "http://192.168.100.105:5174"   // 👈 frontend running on Laptop A
  ],
  credentials: true
}));

// ✅ Other middlewares
app.use(cookieParser());
app.use(express.json());
app.get("/ping", (req, res) => {
  res.send("pong 🏓 server is alive!");
});
// ✅ Routes
import router from "./routes/authroutes.js";

app.use("/api/user", router);

import courserouter from "./routes/Courseroute.js";
app.use("/api/course",courserouter)

import userrouter from "./routes/userroutes.js";
app.use("/api/get",userrouter)

import paymentRouter from "./routes/paymentroute.js";
app.use("/api/order",paymentRouter)

import reviewrouter from "./routes/reviewrouter.js";

app.use("/api/review",reviewrouter)

// ✅ Server listener (bind to 0.0.0.0 so other devices can access)
app.listen(port, "0.0.0.0", () => {
  console.log(`✅ App listening on http://0.0.0.0:${port}`);
  console.log(`🌐 Accessible via http://192.168.100.13:${port}`);
});
