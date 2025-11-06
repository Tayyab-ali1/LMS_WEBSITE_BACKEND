import mongoose from "mongoose";


const reviewschema = new mongoose.Schema({
    course:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course"
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    rating:{
        type:Number,
        required:true,
        min:1,
        max:5,
    },
    comment:{
        type:String,
        trim:true
    },
    reviewedAt:{
        type:Date,
        default:Date.now
    }


},{timestamps:true})

const Review= mongoose.model("Review",reviewschema)

export default Review