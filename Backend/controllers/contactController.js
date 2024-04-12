const asyncHandler = require("express-async-handler")
const Contact = require("../models/contactModel")

//@desc Get all contacts
//@route Get /api/contacts
//@access private
const getContacts = asyncHandler(async (req, res) => {
  // send contacts to the client side
  const contacts = await Contact.find()
  res.status(200).json(contacts)
})

//@desc Create new contact
//@route POST /api/contacts
//@access private
const createContact = asyncHandler(async (req, res) => {
  // register contact to the server side/db
  console.log("The request body is :", req.body)
  const { name, email, phone } = req.body // destructure data
  if (!name || !email || !phone) {
    res.status(400)
    throw new Error("All fields are mandatory")
  }
  const contact = await Contact.create({
    name, email, phone, user_id: req.user.id,
  })
  res.status(201).json(contact)
})

//@desc Get contact
//@route GET /api/contact/:id
//@access private
const getContact = asyncHandler(async (req, res) => {
  // send contact to the client side
  const contact = await Contact.findById(req.params.id)
  if (!contact) {
    res.status(404)
    throw new Error("Contact not found")
  }
  if (contact.user_id.toString() !== req.user.id) {
    res.status(403)
    throw new Error("You can't access this contact")
  }
  res.status(200).json(contact)
})

//@desc Update new contact
//@route GET /api/contact/:id
//@access private
const updateContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id)
  if (!contact) {
    res.status(404)
    throw new Error("Contact not found")
  }

  // Update contact on the server side/db
  const updatedContact = await Contact.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  )
  if (contact.user_id.toString() !== req.user.id) {
    res.status(403)
    throw new Error("You can't edit this contact")
  }

  res.status(200).json(updatedContact)
})

//@desc Delete contact
//@route GET /api/contact/:id
//@access private
const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id)
  if (!contact) {
    res.status(404)
    throw new Error("Contact not found")
  }
  if (contact.user_id.toString() !== req.user.id) {
    res.status(403)
    throw new Error("You can't delete this contact")
  }

  // Delete contact on the server side/db
  await Contact.findOneAndDelete(req.params.id)
  res.status(200).json(contact)
})

module.exports = { getContacts, createContact, getContact, updateContact, deleteContact }