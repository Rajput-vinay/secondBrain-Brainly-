import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const authMiddlewares = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];  // Safely handle undefined authorization header
    if (!token) {
      return res.status(401).json({
        message: "User not logged in",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    if (typeof decoded === 'object' && 'id' in decoded) {
      req.body.userId = (decoded as JwtPayload).id;
    } else {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Server side error",
    });
  }
};
