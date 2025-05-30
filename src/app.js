import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
  }))
  
/*app.use(express.json({
  limit: "16kb"
  }))*/
app.use(express.json())

app.use(express.urlencoded({ extended: true }));
  
app.use(express.static("public"))
  
app.use(cookieParser())


//routes

import userRouter from "./routes/user.routes.js"

console.log("Mounting App Js")
app.use("/api/v1/users",userRouter)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

export { app }