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
    fullname,
    email,
    password,
    username,
  } = req.body
  
  if (
    [fullname,email,password,username].some((i)=>i?.trim() === "")
    ) {
      throw new ApiError(400,"All Fields Required")
    }
    
  const existed = await User.findOne({
    $or: [{username},{email}]
    })
    
  if (existed) {
    throw new ApiError(409,"User With Same Email/Username Exists")
  }
  
  const avatarLocalPath = req.files?.avatar[0]?.path
  const coverImgLocalPath = req.files?.coverImg[0]?.path
  
  if (!avatarLocalPath){
    throw new ApiError(400,"Avatar Is Required")
  }
  
  const avatarPath = await cloudinaryUpload(avatarLocalPath)
  const coverImgPath = await cloudinaryUpload(coverImgLocalPath)
  
  if (!avatarPath){
    throw new ApiError(400,"Avatar Is Required")
  }
  
  const user = await User.create({
    fullname,
    avatar: avatarPath.url,
    coverImg: coverImgPath?.url || "",
    password,
    email,
    username: username.toLowerCase()
  })
  
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
    )

  res.status(201).json({
    message: email
  })
  
} )

export { registerUser }