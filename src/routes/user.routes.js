import { Router } from "express"
import { registerUser } from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middlewares.js"

const router = Router()

console.log("User Router Mounted")


router.post(
  "/login",
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

export default router