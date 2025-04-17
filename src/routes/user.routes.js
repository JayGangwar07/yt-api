import { Router } from "express"
import {
registerUser,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword } from
"../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middlewares.js"
import {verifyJwt} from "../middlewares/auth.middleware.js"

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
  
router.post("/login",upload.none(),loginUser)

// Secured Routes

router.post("/logout",verifyJwt,logoutUser)

router.post("/password",changeCurrentPassword)

router.post("/refresh",refreshAccessToken)



export default router