// Unit testing every contact endpoint
const request = require('supertest')
const express = require('express')
const contactRoutes = require('../../routes/contactRoutes')
const { getContacts, createContact, getContact, updateContact, deleteContact } = require('../../controllers/contactController')
const validateToken = require('../../middleware/validateTokenHandler')

const mockContacts = [
  {
    _id: 'contact123',
    user_id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    phone: '123-456-7890',
    createdAt: '2024-08-20T11:13:55.453Z',
    updatedAt: '2024-08-20T11:13:55.453Z',
  },
  {
    _id: 'contact123',
    user_id: 'user456',
    name: 'User Test',
    email: 'User@example.com',
    phone: '098-765-4321',
    createdAt: '2024-08-20T11:13:55.453Z',
    updatedAt: '2024-08-20T11:13:55.453Z',
  },
]

// Mock the controllers
jest.mock('../../controllers/contactController', ()=>({
  getContacts: jest.fn((req, res) => res.status(200).json(mockContacts)),
  createContact: jest.fn((req, res) => res.status(201).json(mockContacts[0])),
  getContact: jest.fn((req, res) => res.status(200).json(mockContacts.find(contact => contact.user_id === 'user123'))),
  updateContact: jest.fn((req, res) => res.status(200).json(mockContacts[1])),
  deleteContact: jest.fn((req, res) => res.status(200).json(mockContacts[0]))
}))

// Mock the middleware
jest.mock('../../middleware/validateTokenHandler', () => jest.fn((req, res, next) => {
  req.user = {
    email: 'test@example.com',
    username: 'testUser',
    id: 'user123',
    password: 'hashedPassword',
  }
  next()
}))

const app = express()
app.use(express.json())
app.use('/contacts', contactRoutes)

describe('Contact Routes', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should call validateToken middleware', async () => {
      await request(app).get('/contacts')
      expect(validateToken).toHaveBeenCalledTimes(1)
  })

  test('should return a list of contacts', async () => {
    const res = await request(app).get('/contacts').set('Authorization', 'Bearer fake-jwt-token')

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual(mockContacts)
    expect(getContacts).toHaveBeenCalledTimes(1)
  })

  test('should create a new contact', async () => {
      const res = await request(app).post('/contacts').send(mockContacts[0]).set('Authorization', 'Bearer fake-jwt-token')

      expect(res.statusCode).toBe(201)
      expect(res.body).toEqual(mockContacts[0])
      expect(createContact).toHaveBeenCalledTimes(1)
  })

  test('should return a single contact', async () => {
      const res = await request(app).get('/contacts/user123').set('Authorization', 'Bearer fake-jwt-token')

      expect(res.statusCode).toBe(200)
      expect(res.body).toEqual(mockContacts[0])
      expect(getContact).toHaveBeenCalledTimes(1)
  })

  test('should update the contact and return it', async () => {
    const res = await request(app).put('/contacts/user456').send(mockContacts[1]).set('Authorization', 'Bearer fake-jwt-token')

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual(mockContacts[1])
    expect(updateContact).toHaveBeenCalledTimes(1)
  })

  test('should delete the contact and return a success message', async () => {
    const res = await request(app).delete('/contacts/user123')

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual(mockContacts[0])
    expect(deleteContact).toHaveBeenCalledTimes(1)
  })
})
