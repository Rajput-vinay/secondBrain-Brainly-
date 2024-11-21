import mongoose from "mongoose";
import {v4 as uuidv4} from 'uuid'
 const linkSchema = new mongoose.Schema({
    hash:{
        type:String,
        require:true,
        unique:true,
        default: uuidv4,
    }, 
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
},{timestamps:true})


export const linkModel = mongoose.model('link',linkSchema)