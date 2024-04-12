const express = require("express")
const router = express.Router()
const { registerUser, loginUser, getUser, deleteUser } = require("../controllers/userController")
const validateToken = require("../middleware/validateTokenHandler")

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/me").get(validateToken, getUser)
router.route("/:id").delete(validateToken, deleteUser)

module.exports = router