const mongoose = require('mongoose')
const Contact = require('../../models/contactModel')
const {getContacts, createContact, getContact, updateContact, deleteContact} = require('../../controllers/contactController')

jest.mock('../../models/contactModel')


describe('testing getContacts', () => {
  let req, res

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })
  
  test('should return a list of contacts with status 200', async () => {
    const mockContacts = [
      {
        _id: new mongoose.Types.ObjectId(),
        user_id: new mongoose.Types.ObjectId(),
        name: 'Test User',
        email: 'test@example.com',
        phone: '123-456-7890',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new mongoose.Types.ObjectId(),
        user_id: new mongoose.Types.ObjectId(),
        name: 'User Test',
        email: 'User@example.com',
        phone: '098-765-4321',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    Contact.find.mockResolvedValue(mockContacts)

    await getContacts(req,res)
    
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(mockContacts)
    expect(Contact.find).toHaveBeenCalledTimes(1)
  })
})

describe('testing createContact', ()=>{
  let req, res, next

  beforeEach(()=>{
    req = {
      body: {}
    }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    next = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should create a new contact', async () => {
    const mockContact = {
      _id: new mongoose.Types.ObjectId(),
      user_id: '507f191e810c19729de860eb',
      name: 'Test User',
      email: 'test@example.com',
      phone: '123-456-7890',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const req = {
      body: {
        name: 'Test User',
        email: 'test@example.com',
        phone: '123-456-7890',
      },
      user: { id: '507f191e810c19729de860eb' }}
    
    Contact.create.mockResolvedValue(mockContact)
  
    await createContact(req, res)
  
    expect(Contact.create).toHaveBeenCalledWith({
      name: 'Test User',
      email: 'test@example.com',
      phone: '123-456-7890',
      user_id: '507f191e810c19729de860eb',
    })
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith(mockContact)
  })

  test('should return 400 if any field is missing', async () => {
    const req = {
      body: {
        name: 'Test User',
        email: '',
        phone: '123-456-7890',
      },
      user: { id: '507f191e810c19729de860eb' }}
  
    await expect(createContact(req, res)).rejects.toThrow('All fields are mandatory')
  
    expect(res.status).toHaveBeenCalledWith(400)
    expect(Contact.create).not.toHaveBeenCalled()
    // expect(next).toHaveBeenCalledWith(new Error("All fields are mandatory!"))
  })
})

describe('testing getContact', () => {
  let req, res

  beforeEach(()=>{
   req = {
      params: { id: '507f191e810c19729de860eb' },
      user: { id: '507f191e810c19729de860eb' },
    }
   res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should return contact if found and user is authorized', async () => {
    const mockContact = {
      _id: new mongoose.Types.ObjectId(),
      user_id: req.user.id,
      name: 'Test User',
      email: 'test@example.com',
      phone: '123-456-7890',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    Contact.findById.mockResolvedValue(mockContact)

    await getContact(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(mockContact)
  })
  
  test('should return 404 if contact not found', async () => {
    Contact.findById.mockResolvedValue(null)
  
    await expect(getContact(req, res)).rejects.toThrow('Contact not found')
    expect(res.status).toHaveBeenCalledWith(404)
  })
  
  test('should return 403 if user is not authorized to access contact', async () => {
    const mockContact = {
      _id: new mongoose.Types.ObjectId(),
      user_id: "another_user",
      name: 'Test User',
      email: 'test@example.com',
      phone: '123-456-7890',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  
    Contact.findById.mockResolvedValue(mockContact)
  
    await expect(getContact(req, res)).rejects.toThrow("You can't access this contact")
    expect(res.status).toHaveBeenCalledWith(403)
  })
})

describe('testing updateContact', () => {
  let req, res, next
  
  const mockContact = {
    _id: '66c4342fe1b96b67fdbbcddc',
    user_id: '507f191e810c19729de860eb',
    name: 'Test User',
    email: 'test@example.com',
    phone: '123-456-7890',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(()=>{
   req = {
    params: {},
    body: {},
    user: {}
    }
   res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }
    next = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should successfully update a contact', async () => {
    req = {
      params: { id: '66c4342fe1b96b67fdbbcddc' },
      body: { name: 'Test Updated', email: 'test@updated.com' },
      user: { id: '507f191e810c19729de860eb' }
      }

    Contact.findById.mockResolvedValue(mockContact)
    Contact.findByIdAndUpdate.mockResolvedValue({
      ...mockContact,
      name: req.body.name,
      email: req.body.email,
    })
  
    await updateContact(req, res, next)
  
    expect(Contact.findByIdAndUpdate).toHaveBeenCalledWith(
      req.params.id,
      req.body,
      { new: true }
    )
  
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      ...mockContact,
      name: req.body.name,
      email: req.body.email,
    })
  })
  
  test('should return 403 if user is not authorized to update contact', async () => {
    req.user.id = 'different_user_id'
  
    await expect(updateContact(req, res)).rejects.toThrow("You can't edit this contact")
  
    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).not.toHaveBeenCalled()
  })
  
  test('should handle case when contact is not found', async () => {
    Contact.findById.mockResolvedValue(null)
  
    await expect(updateContact(req, res)).rejects.toThrow('Contact not found')
  
    expect(res.status).toHaveBeenCalledWith(404)
  })
})

describe('testing deleteContact', () => {
  let req, res, next, mockContact

  beforeEach(() => {
    mockContact = {
      _id: '66c4342fe1b96b67fdbbcddc',
      user_id: '507f191e810c19729de860eb',
      name: 'Test User',
      email: 'test@example.com',
      phone: '123-456-7890',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    req = {
      params: { id: mockContact._id },
      user: { id: mockContact.user_id },
    }

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    next = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should delete the contact and return status 200 with the contact data', async () => {
    Contact.findById.mockResolvedValue(mockContact)
    Contact.findOneAndDelete.mockResolvedValue(mockContact)

    await deleteContact(req, res, next)

    expect(Contact.findById).toHaveBeenCalledWith(req.params.id)
    expect(Contact.findOneAndDelete).toHaveBeenCalledWith(req.params.id)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(mockContact)
  })

  test('should return 404 if the contact is not found', async () => {
    Contact.findById.mockResolvedValue(null)

    await deleteContact(req, res, next)

    expect(Contact.findById).toHaveBeenCalledWith(req.params.id)
    expect(res.status).toHaveBeenCalledWith(404)
    expect(next).toHaveBeenCalledWith(new Error("Contact not found"))
  })

  test('should return 403 if the user is not authorized to delete the contact', async () => {
    const anotherUserContact = { ...mockContact, user_id: 'anotherUserId' }
    Contact.findById.mockResolvedValue(anotherUserContact)

    await deleteContact(req, res, next)

    expect(Contact.findById).toHaveBeenCalledWith(req.params.id)
    expect(res.status).toHaveBeenCalledWith(403)
    expect(next).toHaveBeenCalledWith(new Error("You can't delete this contact"))
  })
})