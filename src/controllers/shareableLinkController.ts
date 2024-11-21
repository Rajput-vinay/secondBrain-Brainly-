import {Request, Response} from 'express'
import { linkModel } from '../models/linkModel'

const createShareableLink = async ( req: Request, res: Response): Promise<Response> =>{
 try {
    const userId = req.body.userId
    if(!userId){
        res.status(411).json({
            message:"Login Please"
        })
    }
    const newShareId = await linkModel.create({userId})
     return res.status(200).json({
        message:"Share link created successfully.",
        newShareId
     })
 } catch (error) {
    console.error("Error creating share link:", error)
    return res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
 }
}