
// Define routes with proper methods and paths
import { Request, Response, Router } from 'express';
import { z } from 'zod';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { userModel } from '../models/userModel';
import { authMiddlewares } from '../middlewares/authMiddleware';
import { contentModel } from '../models/contentModel';
import { linkModel } from '../models/linkModel';
import {v4 as uuidv4} from 'uuid'
dotenv.config();

const userRouter = Router();

// Zod schema for input validation
const signUpData = z.object({
  username: z.string()
    .min(3, { message: "Username must be at least 3 characters long" })
    .max(20, { message: "Username must not exceed 20 characters" }),
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
});

// Infer TypeScript type from Zod schema
type SignUpInput = z.infer<typeof signUpData>;

userRouter.post('/signup', async (req: Request, res: Response): Promise<any> => {
  // Validate input using Zod
  const result = signUpData.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid input data",
      errors: result.error.errors, // Provide detailed error messages
    });
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
    const user = await userModel.create({
      username,
      email,
      password: hashedPassword,
    });

    // Generate a JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET as string, // Ensure JWT_SECRET is defined
      { expiresIn: '1h' }
    );

    // Send success response
    return res.status(201).json({
      message: "User registered successfully",
      token,
    });
  } catch (error) {
    console.error("Error in /signup route:", error); // Log the error for debugging
    return res.status(500).json({ message: "Internal server error" });
  }
});




const signInData = z.object({
    email: z.string().email({ message: "Email is not in proper format" }),
    password: z.string().min(6),
  });

  type signInInput = z.infer<typeof signInData>;

userRouter.post('/login', async(req: Request, res: Response): Promise<any> =>{
    const result = signInData.safeParse(req.body)

    if(!result.success){
            return res.status(411).json({
                message: "Invalid input",
                error: result.error.errors,
        });
    }

    try {
        const {password,email}: signInInput = result.data

        const existingUser = await userModel.findOne({email})

        if(!existingUser){
           res.status(403).json({
            message:"Invalid email"
           })
        }
        
        const confirmPassword = await bcryptjs.compare(password,existingUser!.password)
        if(!confirmPassword){
            res.status(403).json({
                message:"Invalid Password"
            })
        }
        
        const token = await jwt.sign(
            { id: existingUser!._id },
            process.env.JWT_SECRET as string,
            { expiresIn: '1h' } // Correct option
          );

        return res.status(200).json({
            message:'User signIn Successfully',
            token
        })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }

  }); 




  const contentData = z.object({
    link: z.string(),
    types: z.string(),
    title: z.string().min(3, "Title must be at least 3 characters long"),
    tags: z.string().min(3, "Tags must be at least 3 characters long"),
  });
  
  type contentInput = z.infer<typeof contentData>;

userRouter.post('/content',authMiddlewares, async (req: Request, res: Response): Promise<any> => {

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
});




userRouter.get('/content',authMiddlewares, async (req: Request, res: Response): Promise<any> => {
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
  });



userRouter.delete('/delete/:id',authMiddlewares, async (req: Request, res: Response): Promise<any> => {
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
});


userRouter.post('/share',authMiddlewares, async ( req: Request, res: Response): Promise<any> =>{
    try {
       const userId = req.body.userId
       const {share} = req.body
       if(!userId){
           res.status(411).json({
               message:"Login Please"
           })
       }
   
       const hash = uuidv4()
       if(share){
            await linkModel.create({
               userId:userId,
               hash:hash
           })
           return res.status(200).json({
               message:"Share link created successfully.",
               sharedLink: "/share/"+ hash
            })
       }
       else{
           await linkModel.deleteOne({
               userId:userId
           })
   
           return res.status(200).json({
               message:"Share link Removed.",
              
            })
       }
       
        
    } catch (error) {
       console.error("Error creating share link:", error)
       return res.status(500).json({
         message: "Server error",
         error: error instanceof Error ? error.message : "Unknown error",
       });
    }
   });
userRouter.get('/share/:shareLink', async (req: Request, res: Response): Promise<any> => {
    try {
        const { shareLink } = req.params;

        // Validate if the shareLink exists
        if (!shareLink) {
            return res.status(400).json({
                message: "Share link is required."
            });
        }

        // Find the link by the hash and populate the user details
        const linkShared = await linkModel.findOne({ hash: shareLink });

        // If the share link is not found
        if (!linkShared) {
            return res.status(404).json({ message: "Share link not found." });
        }

        const content = await contentModel.find({userId:linkShared.userId})
        const user = await userModel.findOne({_id:linkShared.userId})
        // If found, return the link details
        return res.status(200).json({
            message: "Share link retrieved successfully.",
            content:content,
            username:user?.username
        });
    } catch (error) {
        console.error("Error retrieving share link:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}
);

export default userRouter;
