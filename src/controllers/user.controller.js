import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import {cloudinaryUpload} from "../utils/cloudinary.js"

const registerUser = asyncHandler( async(req,res) => {
  
  console.log("Register endpoint hit");

  // Get Details From Frontend
  // Validate Data
  // Check If Already Exists
  // Check For Files Avatar And CoverImg
  // Upload To Cloudinary
  // Create User Object In db
  // Remove Password And Refresh Token From Response
  // Check If User was Created
  // return res

  const {
    email,
    password,
    fullname,
    username,
  } = req.body
  
  if (
    [email,password,fullname,username].some((field)=>field?.trim() === "")
    ){
      console.log("Inavlid Details")
      throw new ApiError(401,"Invalid Details")
    }

  res.status(201).json({
    "mail": email,
    "pass": password,
    "name": fullname,
    "userTag": username,
  })
  
} )

export { registerUser }