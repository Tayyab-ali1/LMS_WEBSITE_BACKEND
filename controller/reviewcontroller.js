import Course from "../model/coursemodel.js";
import Review from "../model/reviewmodel.js";

export const coursereview = async (req, res) => {
  try {
    const { comment, rating, courseId } = req.body;
    const userId = req.user?._id|| req.user?._id; // safer extraction

    if (!comment || !rating || !courseId) {
      return res.status(400).json({ message: "Rating, comment, and courseId are required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const alreadyReview = await Review.findOne({ course: courseId, user: userId });
    if (alreadyReview) {
      return res.status(400).json({ message: "You have already reviewed this course" });
    }

    const review = await Review.create({
      course: courseId,
      user: userId,
      rating,
      comment,
    });

    course.reviews.push(review._id);
    await course.save();

     return res.status(200).json(
      
      review,
    );
  } catch (error) {
    console.error("Error while adding review:", error);
    return res.status(500).json({ message: "Internal server error while adding review" });
  }
};

export const getreview = async (req, res) => {
  try {
    const review = await Review.find({})
      .populate( "user course") // ✅ no commas inside field string
      .sort({ reviewedAt: -1 }); // ✅ corrected field name typo

    return res.status(200).json(
      
      review,
    );
  } catch (error) {
    console.error("Error while getting reviews:", error);
    return res.status(500).json({ message: "Internal server error while getting reviews" });
  }
};
