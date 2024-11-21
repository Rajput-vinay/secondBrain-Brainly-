import { Request, Response } from "express";
import { contentModel } from "../models/contentModel";

const contentFetch = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.body.userId;

    if (!userId) {
      return res.status(400).json({
        message: "userId not provided in the request body",
      });
    }

    // Fetch user content
    const userContent = await contentModel
      .find({ userId }) 
      .populate("User", "-password email"); 

    if (!userContent.length) {
      return res.status(404).json({
        message: "No content found for the provided userId",
      });
    }

    return res.status(200).json({
      message: "Successfully fetched the content",
      content: userContent,
    });
  } catch (error) {
    console.error("Error fetching content:", error);
    return res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export default contentFetch;
