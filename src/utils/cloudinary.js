import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const cloudinaryUpload = async (localFilePath) => {

    try {
        if (!localFilePath) {
            console.log("Empty file path provided")
            return null
        }
        
        // Upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath)
        
        // File has been uploaded successfully
        console.log("File is uploaded on cloudinary ", response.url)
        
        // Clean up the local file if needed
        fs.unlinkSync(localFilePath)
        
        return response

    } catch (error) {
        console.error("Error uploading to Cloudinary:", error)
        
        // Remove the locally saved temporary file as the upload operation failed
        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath)
        }
        
        return null
    }
}

export {cloudinaryUpload}