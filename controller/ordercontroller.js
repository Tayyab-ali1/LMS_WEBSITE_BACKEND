import dotenv from "dotenv";
import fetch from "node-fetch"; // make sure you have `npm i node-fetch`
import Course from "../model/coursemodel.js";
import User from "../model/usermodel.js";

dotenv.config();

const SAFE_PAY_BASE_URL = "https://sandbox.api.getsafepay.com"; // sandbox endpoint
const SAFE_PAY_SECRET = process.env.SAFEPAY_SECRET_KEY; // secret key
const SAFE_PAY_PUBLIC = process.env.SAFEPAY_PUBLIC_KEY; // public key (optional for redirects)

// ------------------------------
// Create Safepay Order
// ------------------------------
export const createSafepayOrder = async (req, res) => {
  try {
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Safepay takes amount in paisa (like PKR * 100)
    const amountInPaisa = course.price * 100;

    // Prepare payload
    const payload = {
      amount: amountInPaisa,
      currency: "PKR",
      callback_url: "http://localhost:8000/api/order/verifypayment", // replace with your backend endpoint
      source: "custom",
    };

    // Call Safepay Init API
    const response = await fetch(`${SAFE_PAY_BASE_URL}/order/v1/init`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SAFE_PAY_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return res
        .status(400)
        .json({ message: "Safepay order init failed", error: data });
    }

    return res.status(200).json({
      message: "Safepay order created successfully",
      safepayData: data,
    });
  } catch (error) {
    console.error("Safepay order error:", error);
    return res.status(500).json({ message: "Server error creating order" });
  }
};

// ------------------------------
// Verify Payment (after callback)
// ------------------------------
export const verifySafepayPayment = async (req, res) => {
  try {
    const { courseId, userId, tracker } = req.body; // Safepay returns a `tracker` token for each payment

    // Fetch payment status
    const response = await fetch(`${SAFE_PAY_BASE_URL}/order/v1/status`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SAFE_PAY_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tracker }),
    });

    const statusData = await response.json();

    if (statusData.status === "PAID" || statusData.data?.state === "paid") {
      // Enroll user
      const user = await User.findById(userId);
      if (user && !user.enrollCourses.includes(courseId)) {
        user.enrollCourses.push(courseId);
        await user.save();
      }

      const course = await Course.findById(courseId).populate("lectures");
      if (course && !course.enrolledStudents.includes(userId)) {
        course.enrolledStudents.push(userId);
        await course.save();
      }

      return res.status(200).json({
        message: "Payment verified and student enrolled successfully",
        transaction: statusData,
      });
    } else {
      return res.status(400).json({
        message: "Payment not successful. Try again.",
        transaction: statusData,
      });
    }
  } catch (error) {
    console.error("Safepay verify error:", error);
    return res
      .status(500)
      .json({ message: `Internal server error: ${error.message}` });
  }
};
