import express from "express"
import dotenv from 'dotenv'
import { databaseConnect } from "./database"
dotenv.config()



const app = express()

app.use(express.json())

const RUNNING_PORT = process.env.PORT || 4000 

databaseConnect()
app.listen( RUNNING_PORT, () =>{
    console.log(`application running on the PORT ${RUNNING_PORT}`)
})