import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import {cloudinaryUpload} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const registerUser = asyncHandler( async(req,res) => {
  

  // Get Details From Frontend -> Done
  // Validate Data -> Done
  // Check If Already Exists -> Done
  // Check For Files Avatar And CoverImg -> Done
  // Upload To Cloudinary -> Done
  // Create User Object In db -> Done
  // Remove Password And Refresh Token From Response -> Done
  // Check If User was Created -> Done
  // return res

  const {
    email,
    password,
    fullname,
    username,
  } = req.body

  //validation
  if (
    [email,password,fullname,username].some((field)=>field?.trim() === "")
    ){
      console.log("Inavlid Details")
      throw new ApiError(411,"Invalid Details")
    }
    
    if (
    [email,password,fullname,username].some((i)=>i===undefined)
    ) throw new ApiError(403,"Please Enter All Details")
    
  //Check If Already Exists

  const existingUser = await User.findOne({
    $or: [{username},{email}]
  })
  
  if (existingUser){
    throw new ApiError(403, "User Already Exists")
  }
  
  //Check For Files
  
  let avatarLocalPath;
  let coverImgLocalPath;
  
  if (req.files.avatar){
    avatarLocalPath = req.files.avatar[0].path
  }
  
  if (req.files.coverImg){
    coverImgLocalPath = req.files.coverImg[0].path
  }
  else coverImgLocalPath = ""
  
  console.log(avatarLocalPath)
  console.log(coverImgLocalPath)
  
  if (!avatarLocalPath){
    throw new ApiError(403,"Enter Avatar")
  }
  
  // Upload To Cloudinary
  
  const avatar = await cloudinaryUpload(avatarLocalPath)
  const coverImg = await cloudinaryUpload(coverImgLocalPath)

  // Create User Object In db
  
  const user = await User.create({
    fullname,
    username: username.toLowerCase(),
    password,
    email,
    avatar: avatar.url,
    coverImg: coverImg?.url || ""
  })
  
  console.log("MongoDB Entry: ",user)
  
  // Reomve Password And Refresh Token From Response
  
  const createdUser = await User.findById(user._id).select("-password -refreshToken")
  

  // Check If User Was Created
  
  if (!createdUser){
    throw new ApiError(501,"User Couldn't Be Created")
  }

  return res.status(201).json(
    new ApiResponse(200, "User Was Created Succesfully", createdUser)
  )
  
} )

const loginUser = asyncHandler(async (req,res) => {
  
})

export { 
  registerUser,
  loginUser
  }