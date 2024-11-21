import { Request, Response } from 'express';
import { z } from 'zod';
import bcryptjs from 'bcryptjs';
import { userModel } from '../models/userModel';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// Zod schema for input validation
const signUpData = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email({ message: "Email is not in proper format" }),
  password: z.string().min(6),
});

// Infer TypeScript type from Zod schema
type SignUpInput = z.infer<typeof signUpData>;

export const signup = async (req: Request, res: Response): Promise<Response> => {
  // Validate input using Zod
  const result = signUpData.safeParse(req.body);

  if (!result.success) {
    return res.status(411).json({
      message: "Invalid input",
      error: result.error.errors,
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
      process.env.JWT_SECRET as string, 
      { expiresIn: '1h' }
    );

    // Send success response
    return res.status(201).json({
      message: "User registered successfully",
      token,
    });
  } catch (error) {
    
    return res.status(500).json({ message: "Internal server error" });
  }
};



// ---------------------------------------------------------------------------------------


// Zod schema for input validation
const signInData = z.object({
    email: z.string().email({ message: "Email is not in proper format" }),
    password: z.string().min(6),
  });

  type signInInput = z.infer<typeof signInData>;

  const login = async(req: Request, res: Response): Promise<Response> =>{
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

  }




  