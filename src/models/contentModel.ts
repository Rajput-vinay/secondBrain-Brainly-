import mongoose from "mongoose";

const contentSchema = new mongoose.Schema({
    link:{
        type:String,
        required:true
    },
    types:{
      type:String,
      enum:[,'Youtube','Twitter'],
      default:'Youtube'
    },
    title:{
        type: String,
        required: true
    },
    tags:{
        type: String,
        
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }


},{timestamps:true})


export const contentModel = mongoose.model('Content',contentSchema)