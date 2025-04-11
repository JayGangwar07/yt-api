import mongoose from "mongoose"
import {DB_NAME} from "./constants.js"
import express from "express"
import dotenv from "dotenv"


dotenv.config()

const app = express()

;( async () => {
  
  try{
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    console.log(connectionInstance.connection.host)
    
    app.on("error",(error)=>{
      console.log(error)
      throw error
    })
    
    app.listen(process.env.PORT,()=>{
      console.log(`Server running on Port ${process.env.PORT}`)
    })
    
  }
  
  catch(error){
    console.error("Error: ",error)
    throw error
  }
  
} )()