import { Request, Response } from "express";
import { z } from "zod";
import { contentModel } from "../models/contentModel";

const contentData = z.object({
  link: z.string(),
  types: z.string(),
  title: z.string().min(3, "Title must be at least 3 characters long"),
  tags: z.string().min(3, "Tags must be at least 3 characters long"),
});

type contentInput = z.infer<typeof contentData>;

const content = async (req: Request, res: Response): Promise<Response> => {

  const result = contentData.safeParse(req.body);

  if (!result.success) {
    return res.status(422).json({
      message: "Invalid data format",
      errors: result.error.format(),
    });
  }

  try {
    const { link, types, title, tags }: contentInput = result.data;
    const userId = req.body.userId;

    if (!userId) {
      return res.status(404).json({
        message: "User ID not found in the request",
      });
    }

    // Create new content
    const newContent = await contentModel.create({
      title,
      tags,
      link,
      types,
      userId,
    });

    return res.status(201).json({
      message: "Content created successfully",
      content: newContent,
    });
  } catch (error) {
    console.error("Error creating content:", error);
    return res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export default content;
