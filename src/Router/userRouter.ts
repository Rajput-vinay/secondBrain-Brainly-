// Required imports
import { Request, Response, Router } from 'express';
import { z } from 'zod';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { userModel } from '../models/userModel';
import { contentModel } from '../models/contentModel';
import { linkModel } from '../models/linkModel';
import { authMiddlewares } from '../middlewares/authMiddleware';

dotenv.config();

const userRouter = Router();

// Zod schemas for validation
const signUpData = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long" })
    .max(20, { message: "Username must not exceed 20 characters" }),
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
});

const signInData = z.object({
  email: z.string().email({ message: "Email is not in proper format" }),
  password: z.string().min(6),
});

const contentData = z.object({
  link: z.string(),
  types: z.string(),
  title: z.string().min(3, "Title must be at least 3 characters long"),
  tags: z.string().min(3, "Tags must be at least 3 characters long"),
});

// TypeScript types inferred from schemas
type SignUpInput = z.infer<typeof signUpData>;
type SignInInput = z.infer<typeof signInData>;
type ContentInput = z.infer<typeof contentData>;

// Routes

// User signup route
userRouter.post('/signup', async (req: Request, res: Response): Promise<any> => {
  const result = signUpData.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: "Invalid input data", errors: result.error.errors });
  }

  try {
    const { username, password, email }: SignUpInput = result.data;

    // Check if the user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists with this email" });
    }

    // Hash the password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create a new user
    const user = await userModel.create({ username, email, password: hashedPassword });

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '1h' });

    return res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    console.error("Error in /signup route:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// User login route
userRouter.post('/login', async (req: Request, res: Response): Promise<any> => {
  const result = signInData.safeParse(req.body);
  if (!result.success) {
    return res.status(411).json({ message: "Invalid input", error: result.error.errors });
  }

  try {
    const { email, password }: SignInInput = result.data;
    const existingUser = await userModel.findOne({ email });

    if (!existingUser) {
      return res.status(403).json({ message: "Invalid email" });
    }

    const confirmPassword = await bcryptjs.compare(password, existingUser.password);
    if (!confirmPassword) {
      return res.status(403).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET!, { expiresIn: '1h' });

    return res.status(200).json({ message: 'User signed in successfully', token });
  } catch (error) {
    console.error("Error in /login route:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Add content
userRouter.post('/content', authMiddlewares, async (req: Request, res: Response): Promise<any> => {
  const result = contentData.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({ message: "Invalid data format", errors: result.error.format() });
  }

  try {
    const { link, types, title, tags }: ContentInput = result.data;
    const userId = req.body.userId // Assume userId is stored in the request after the authMiddleware

    const newContent = await contentModel.create({ title, tags, link, types, userId });

    return res.status(201).json({ message: "Content created successfully", content: newContent });
  } catch (error) {
    console.error("Error creating content:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get all content for a user
userRouter.get('/content', authMiddlewares, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.body.userId // Assume userId is extracted in authMiddleware
    const userContent = await contentModel.find({ userId });

    if (!userContent.length) {
      return res.status(404).json({ message: "No content found for the provided userId" });
    }

    return res.status(200).json({ message: "Successfully fetched the content", content: userContent });
  } catch (error) {
    console.error("Error fetching content:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Delete content
userRouter.delete('/delete/:id', authMiddlewares, async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const deleteContent = await contentModel.findByIdAndDelete(id);
    if (!deleteContent) {
      return res.status(404).json({ message: "Content not found or already deleted" });
    }

    return res.status(200).json({ message: "Content deleted successfully", deletedContent: deleteContent });
  } catch (error) {
    console.error("Error deleting content:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Share link creation and removal
userRouter.post('/share', authMiddlewares, async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId, share } = req.body;
    const hash = uuidv4();

    if (share) {
      await linkModel.create({ userId, hash });
      return res.status(200).json({ message: "Share link created successfully.", sharedLink: `/share/${hash}` });
    } else {
      const result = await linkModel.deleteOne({ userId });
      return res.status(200).json({ message: "Share link removed successfully." });
    }
  } catch (error) {
    console.error("Error handling share link:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Fetch shared content
userRouter.get('/share/:shareLink', async (req: Request, res: Response): Promise<any> => {
  try {
    const { shareLink } = req.params;
    const linkShared = await linkModel.findOne({ hash: shareLink });

    if (!linkShared) {
      return res.status(404).json({ message: "Share link not found." });
    }

    const content = await contentModel.find({ userId: linkShared.userId });
    const user = await userModel.findOne({ _id: linkShared.userId });

    return res.status(200).json({ message: "Share link retrieved successfully.", content, username: user?.username });
  } catch (error) {
    console.error("Error retrieving share link:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

export default userRouter;
