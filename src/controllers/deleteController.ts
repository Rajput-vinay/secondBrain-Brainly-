import { Request, Response } from "express";
import { contentModel } from "../models/contentModel";

const deleteController = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({
        message: "userId not provided in the request body",
      });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        message: "Id not found in params",
      });
    }

    // Use the correct method signature for findByIdAndDelete
    const deleteContent = await contentModel.findByIdAndDelete(id);

    if (!deleteContent) {
      return res.status(404).json({
        message: "Content not found or already deleted",
      });
    }

    return res.status(200).json({
      message: "Content deleted successfully",
      deletedContent: deleteContent,
    });
  } catch (error) {
    console.error("Error deleting content:", error);
    return res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export default deleteController;
