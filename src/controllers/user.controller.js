import { asyncHandler } from "../utils/asyncHandler.js"

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

  const {email} = req.body

  res.status(200).json({
    message: email
  })
  
} )

export { registerUser }