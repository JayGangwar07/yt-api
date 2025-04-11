import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
})

async function cloudinaryUpload(localPath){
  
  try{
    
    if (!localPath) return null
    
    const response = await cloudinary.uploader.upload(localPath, {
      resource_type: "auto"
    })
    
    //Succesfull Upload
    
    console.log("File Is Uploaded On Cloudinary !!!", response.url)
    
    return response
    
  }
  
  catch(err){
    fs.unlinkSync(localPath)
    return null
  }
  
}

export {cloudinaryUpload}