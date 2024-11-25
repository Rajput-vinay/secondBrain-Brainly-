import mongoose from "mongoose";

 const linkSchema = new mongoose.Schema({
    hash:{
        type:String,
        require:true,
        unique:true,
        
    }, 
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
},{timestamps:true})


export const linkModel = mongoose.model('link',linkSchema)