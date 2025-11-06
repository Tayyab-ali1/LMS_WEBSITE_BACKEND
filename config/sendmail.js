import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",   // ✅ fixed
  port: 465,
  secure: true, // true for port 465, false for 587
  auth: {
    user: process.env.USEREMAIL,
    pass: process.env.USERPASSWORD, // must be Gmail App Password
  },
});

const sendmail = async (to, otp) => {
  try {
    await transporter.sendMail({
      from: `"Auth System" <${process.env.USEREMAIL}>`, // ✅ better format
      to,
      subject: "RESET YOUR PASSWORD",
      html: `
        <p>Your password reset OTP is:</p>
        <h2>${otp}</h2>
        <p><b>Note:</b> This OTP will expire in 5 minutes.</p>
      `,
    });

    console.log(`✅ OTP sent to ${to}`);
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
};

export default sendmail;
