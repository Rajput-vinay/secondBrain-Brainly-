import express, { Application } from "express"
import dotenv from 'dotenv'
import { databaseConnect } from "./database"
import userRouter from "./Router/userRouter"
import cors from 'cors'
dotenv.config()



const app: Application = express()
app.use(cors())
app.use(express.json())

app.use('/api/v1/users',userRouter)

const RUNNING_PORT = process.env.PORT || 4000 

databaseConnect()
app.listen( RUNNING_PORT, () =>{
    console.log(`application running on the PORT ${RUNNING_PORT}`)
})