import mongoose from "mongoose";
import { model } from "mongoose";
const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true
    },
    email:{
      type:String,
      unique: true,
      required :true
    },
    password:{
        type: String,
        required: true
    }
},
{
    timestamps:true
})

export const userModel = mongoose.model('User',userSchema)
