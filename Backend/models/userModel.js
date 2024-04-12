const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: [true, "Add a username"],
  },
  email: {
    type: String,
    required: [true, "Add your email address"],
    unique: [true, "Email address already taken"] // no duplicates
  },
  password: {
    type: String,
    required: [true, "Password?"],
  }
}, {
  timestamps: true,
})

module.exports = mongoose.model("User", userSchema)