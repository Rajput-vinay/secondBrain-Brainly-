import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config()



const uri: string = process.env.MONGO_DB_URI as string
 export const databaseConnect = () =>{
    try {
        mongoose.connect(uri)
        console.log(`mongoose connected succesfully ${uri}`)
    } catch (error) {
        console.log(`something went wrong while connecting the mongodb database or instance`)
    }
}