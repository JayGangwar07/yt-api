import { Router } from "express"
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImg
} from
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

router.post("/password",verifyJwt,changeCurrentPassword)

router.post("/refresh",refreshAccessToken)

router.post("/user",verifyJwt,getCurrentUser)

router.post("/update",verifyJwt,updateAccountDetails)

router.post("/avatar",verifyJwt,upload.single("avatar"),updateAvatar)

router.post("/cover",verifyJwt,upload.single("coverImg"),updateCoverImg)

export default router