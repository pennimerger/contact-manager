const mongoose = require("mongoose")

const contactSchema = mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  name: {
    type: String,
    required: [true, "Add the contact name"],
  },
  email: {
    type: String,
    required: [true, "Add contact email address"],
  },
  phone: {
    type: String,
    required: [true, "Add phone number"],
  }
}, {
  timestamps: true,
})

module.exports = mongoose.model("Contact", contactSchema)