import { Router } from "express"
import { registerUser } from "../controllers/user.controller.js"

const router = Router()

console.log("User Router Mounted")

router.post("/login",registerUser)
router.route("/register").get(registerUser)

export default router