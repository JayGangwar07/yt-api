import { Router } from "express"
import { registerUser,loginUser } from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middlewares.js"

const router = Router()

console.log("User Router Mounted")


router.post(
  "/register",
  upload.fields([
    {
      name: "avatar",
      maxCount: 1
    },
    {
      name: "coverImg",
      maxCount: 1
    }
    ]),
  registerUser
  )
  
router.post("/login",loginUser)

export default router