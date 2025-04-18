import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import {cloudinaryUpload} from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"
import {ApiResponse} from "../utils/ApiResponse.js"

const generateAccessAndRefreshTokens = async (userId) => {
  
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
  
  const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)
  
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
  
  const options = {
    httpOnly: true,
    secure: true
  }
  
  return res.status(200)
  .cookie("refreshToken",refreshToken,options)
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

const logoutUser = asyncHandler(async(req,res) => {
  
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined
      }
    },
    {
      new: true
    }
    )
  
  const options = {
    httpOnly: true,
    secure: true
  }
  
  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(
    new ApiResponse(200,"Logged Out!!!")
    )
  
})

const refreshAccessToken = asyncHandler(async (req, res) => {
  
  const incomingRefreshToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2ZkMWIwMDc4ZGZmMTcyYWI0NWM4NmQiLCJpYXQiOjE3NDQ4MTI3MzcsImV4cCI6MTc0NTY3NjczN30.g1eqjXdVJ4lDs6U7yDmO-Jh6wq6fPGhBYUeufDzfmms"
  /*
  const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken
  */
  if (!incomingRefreshToken){
    throw new ApiError(400,"Unauthorised Request")
  }
  
  try{
    
    var decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
      )
    
    const user = await User.findById(decodedToken?._id)
    
    console.log(user)
    
    if (!user){
      throw new ApiError(400,"Invalid Refresh Token")
    }
    /*
    if (incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(400,"Refresh Token Is Expired Or Used")
    }*/
    
    var options = {
      httpOnly: true,
      secure: true
    }
    
    var {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user?._id)
    
    console.log("access",accessToken)
    console.log(refreshToken)
    
  }
  
  catch(error){
    throw new ApiError(501,error?.message || "error")
  }
  
  return res
  .status(200)
  .cookie("refreshToken",refreshToken,options)
  .cookie("accessToken",accessToken,options)
  .json(
    new ApiResponse(200,{
      decodedToken,
      incomingRefreshToken,
      refreshToken,
      accessToken
    },"Refreshed Tokens")
    )
  
})

const changeCurrentPassword = asyncHandler(async (req,res) => {
  
  const {oldPassword,newPassword} = req.body
  
  const user = await User.findById(req.user?._id)
  
  const isPasswordValid = user.isPasswordCorrect(oldPassword)
  
  if (!isPasswordValid){
    throw new ApiError(400,"Old Password Is Invalid")
  }
  
  user.password = newPassword
  
  await user.save({validateBeforeSave: false})

  return res
  .status(200)
  .json(
    new ApiResponse(200,{
      oldPassword,
      newPassword,
      "pass": user.password
    },"Password Changed")
    )
  
})

const getCurrentUser = asyncHandler(async (req,res) => {
  return res
  .status(200)
  .json(
    new ApiResponse(200,{
      "user": req.user,
    },"User Found")
    )
})

const updateAccountDetails = asyncHandler(async (req,res) => {
  
  const {fullname,email} = req.body
  
  if (!fullname || !email){
    throw new ApiError(400,"All Fields Are Required")
  }
  
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname: fullname,
        email: email
      }
    },
    {new: true}
    ).select("-password")
  
  return res
  .status(200)
  .json(
    new ApiResponse(200,{
      user
    },"Updated!!!")
    )
  
})

const updateAvatar = asyncHandler(async (req,res) => {
  
  const avatarLocalPath = req.file?.path
  
  if (!avatarLocalPath){
    throw new ApiError(400,"Attach Avatar")
  }
  
  const avatar = cloudinaryUpload(avatarLocalPath)
  
  if (!avatar.url){
    throw new ApiError(400,"Error While Uploading On Cloudinary")
  }
  
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url
      }
    },
    {new: true}
    ).select("-password")
  
  return res
  .status(200)
  .json(
    new ApiResponse(200,user,"Avatar Changed")
    )
  
})


const updateCoverImg = asyncHandler(async (req,res) => {
  
  const coverImgLocalPath = req.file?.path
  
  if (!avatarLocalPath){
    throw new ApiError(400,"Attach Cover Image")
  }
  
  const coverImg = cloudinaryUpload(coverImgLocalPath)
  
  if (!coverImg.url){
    throw new ApiError(400,"Error While Uploading On Cloudinary")
  }
  
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImg: coverImg.url
      }
    },
    {new: true}
    ).select("-password")
  
  return res
  .status(200)
  .json(
    new ApiResponse(200,user,"Cover Image Changed")
    )
  
})

export { 
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImg
}