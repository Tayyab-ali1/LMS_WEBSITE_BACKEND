import dotenv from "dotenv";
import Course from "../model/coursemodel.js";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

export const searchai = async (req, res) => {
  try {
    const { input } = req.body;

    if (!input) {
      return res.status(400).json({ message: "Input is required" });
    }

    const prompt = `
You are an intelligent assistant for a learning platform.
A user gives a query about what they want to learn.
Return **only one keyword** from this list:
[app development, ai/ml, ai tool, data science, data analytic, ethical hacking, ui ux design, web dev, others, beginner, intermediate, advance]
Example: "I want to learn React" → "web dev"
Query: ${input}
`;

    // ✅ create model with the latest v1 endpoint
    const ai = new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});
     const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
     })
   

     const keyword=response.text
    // ✅ call Gemini properly
    
    console.log("🎯 AI keyword:", keyword);

    // Search DB using input or keyword
    let courses = await Course.find({
      ispublished: true,
      $or: [
        { title: { $regex: input, $options: "i" } },
        { subtitle: { $regex: input, $options: "i" } },
        { description: { $regex: input, $options: "i" } },
        { category: { $regex: input, $options: "i" } },
        { level: { $regex: input, $options: "i" } },
      ],
    }).lean();

    if (courses.length === 0 && keyword) {
      courses = await Course.find({
        ispublished: true,
        $or: [
          { title: { $regex: keyword, $options: "i" } },
          { subtitle: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
          { category: { $regex: keyword, $options: "i" } },
          { level: { $regex: keyword, $options: "i" } },
        ],
      }).lean();
    }

    res.status(200).json(courses);
  } catch (error) {
    console.error("❌ Internal server error while searching course:", error);
    res.status(500).json({
      message: "Server error while searching course details",
      error: error.message,
    });
  }
};
