import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import {cloudinaryUpload} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const genearateAccessAndRefreshTokens = async (userId) => {
  
  try{
    
    const user = await User.findById(userId)
    
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
    
    user.refreshToken = refreshToken
    
    await user.save({validateBeforeSave: false})
    

    return {
      accessToken,
      refreshToken
    }
  }
  
  catch(error){
    console.log(error)
    throw new ApiError(500,"Couldn't Generate Tokens")
  }
  
}

const registerUser = asyncHandler( async(req,res) => {
  

  // Get Details From Frontend -> Done
  // Validate Data -> Done
  // Check If Already Exists -> Done
  // Check For Files Avatar And CoverImg -> Done
  // Upload To Cloudinary -> Done
  // Create User Object In db -> Done
  // Remove Password And Refresh Token From Response -> Done
  // Check If User was Created -> Done
  // return res -> Done

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
  
  // Get Details From Frontend -> Done
  // Validate Details -> Done
  // Compare email or username -> Done
  // Access And Refresh Token -> Done
  // Send Cookies
  
  // Get Details From Frontend
  
  const {
    username,
    email,
    password,
  } = req.body
  
  if (!username && !email){
    throw new ApiError(400, "Enter Either Email Or Username")
  }
  
  // Validation
  
  if (
    [email,password,username].some((field)=>field?.trim() === "")
    ){
      console.log("Inavlid Details")
      throw new ApiError(411,"Invalid Details")
    }
    
  // Compare Email Or Username
  
  const user = await User.findOne({
    $or: [{ username },{ email }]
  })
  
  if (!user){
    throw new ApiError(401,"No User With Given Data Exists")
  }
  
  const isPasswordValid = await user.isPasswordCorrect(password)
  
  if (!isPasswordValid){
    throw new ApiError(402,"Incorrect Password")
  }
  
  const {accessToken,refreshToken} = await genearateAccessAndRefreshTokens(user._id)
  
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
  
  const options = {
    httpOnly: true,
    secure: true
  }
  
  res.status(200)
  .cookie("accessToken",accessToken,options)
  .json(
    new ApiResponse(200,
    {
      user: loggedInUser,refreshToken,accessToken
    },
    "Success!!!"
    ))

  /*return
  res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(
    new ApiResponse(
      200,
      {
      user: loggedInUser,accessToken,refreshToken
      },
      "User Logged In Succesfully"
      )
    )*/

})

export { 
  registerUser,
  loginUser
}