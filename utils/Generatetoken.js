import jwt from "jsonwebtoken";

export const genToken = (userId) => {
  try {
    const token = jwt.sign(
      { _id: userId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    return token;
  } catch (error) {
    console.log("Error while creating JWT token:", error.message);
    return null;
  }
};
export const genTokenAdmin = (email) => {
  try {
    const token = jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    return token;
  } catch (error) {
    console.log("Error while creating JWT token:", error.message);
    return null;
  }
};
