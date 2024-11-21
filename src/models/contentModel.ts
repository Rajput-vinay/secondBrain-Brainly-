import mongoose from "mongoose";

const contentSchema = new mongoose.Schema({
    link:{
        type:String,
        required:true
    },
    types:{
      type:String,
      enum:['Instagram','Youtube','Whatsapp','Facebook','Random'],
      default:'Random'
    },
    title:{
        type: String,
        required: true
    },
    tags:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Tags'
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }


},{timestamps:true})


export const contentModel = mongoose.model('Content',contentSchema)