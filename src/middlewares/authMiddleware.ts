
import {Request, Response, NextFunction} from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
export const authMiddlewares = async (req: Request, res: Response, next: NextFunction) =>{

    try {
        const token = req.headers.authorization!.split(" ")[1]
        if(!token){
            res.status(401).json({
                message:"user not login"
            })
        }
    
        const decode = jwt.verify(token, process.env.JWT_SECRET as string)
        if(typeof decode === 'object' && 'id' in decode){
            req.body.userId = (decode as JwtPayload).id;
        }else{
            return res.status(401).json({
                message:"Invalid token"
            })
        }
        
        next()
    } catch (error) {
        return res.status(500).json({
            message:"server side error"
        })
    }
}