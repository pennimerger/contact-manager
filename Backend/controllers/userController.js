const asyncHandler = require("express-async-handler")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("../models/userModel")

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400)
    throw new Error("All fields are mandatory!")
  }
  const userAvailable = await User.findOne({ email })
  if (userAvailable) {
    res.status(400)
    throw new Error("User already registered!")
  }

  const hashedPassword = await bcrypt.hash(password, 10) // hash password
  console.log("Hashed Password: ", hashedPassword)
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
  })
  if (user) {
    res.status(201).json({ _id: user.id, email: user.email })
  } else {
    res.status(400)
    throw new Error("User data is not valid")
  }

})

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    res.status(400)
    throw new Error("All fields are mandatory!")
  }
  const user = await User.findOne({ email })

  // compare password
  if (user && (await bcrypt.compare(password, user.password))) {
    const accessToken = jwt.sign( //sign token with:
      { // *payload
        user: {
          username: user.username,
          email: user.email,
          id: user.id,
        }
      },
      // *secret
      process.env.ACCESS_TOKEN_SECRET, { expiresIn: "50m" }
    )
    res.status(200).json({ accessToken })
  } else {
    res.status(401)
    throw new Error("Invalid email or password")
  }
})

const getUser = asyncHandler(async (req, res) => {
  res.status(200).json(req.user)

})

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    res.status(404)
    throw new Error("Non existent")
  }

  await User.findOneAndDelete(req.params.id)
  res.status(200).json(user)
})

module.exports = { registerUser, loginUser, getUser, deleteUser }