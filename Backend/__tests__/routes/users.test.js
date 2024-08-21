// Unit testing every user endpoint
const request = require('supertest')
const express = require('express')
const router = require('../../routes/userRoutes')
const { registerUser, loginUser, getUser, deleteUser } = require('../../controllers/userController')

// Mock the controllers
jest.mock('../../controllers/userController', () => ({
  registerUser: jest.fn((req, res) => res.status(201).json({ id: 'user123', email: 'testuser@example.com' })),
  loginUser: jest.fn((req, res) => res.status(200).json({ accessToken: 'fake-jwt-token' })),
  getUser: jest.fn((req, res) => res.status(200).json(req.user)),
  deleteUser: jest.fn((req, res) => res.status(200).json({
    email: 'test@example.com',
    username: 'testUser',
    id: 'user123',
    password: 'hashedPassword',
  })),
}))

// Mock the middleware
jest.mock('../../middleware/validateTokenHandler', () => (req, res, next) => {
  req.user = {
    email: 'test@example.com',
    username: 'testUser',
    id: 'user123',
    password: 'hashedPassword',
  } // Mocked decoded user
  next()
})

const app = express()
app.use(express.json())
app.use('/api/users', router)

describe('User Routes', () => {
  test('should register a new user at /register', async () => {
    const res = await request(app).post('/api/users/register').send({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password',
    })

    expect(res.statusCode).toEqual(201)
    expect(res.body).toStrictEqual({ id: 'user123', email: 'testuser@example.com' })
    expect(registerUser).toHaveBeenCalled()
  })

  test('should login a user at /login', async () => {
    const res = await request(app).post('/api/users/login').send({
      email: 'testuser@example.com',
      password: 'password',
    })

    expect(res.statusCode).toEqual(200)
    expect(res.body.accessToken).toBe('fake-jwt-token')
    expect(loginUser).toHaveBeenCalled()
  })

  test('should get user details at /me', async () => {
    const res = await request(app).get('/api/users/me').set('Authorization', 'Bearer fake-jwt-token')

    expect(res.statusCode).toEqual(200)
    expect(res.body).toEqual({
      email: 'test@example.com',
      username: 'testUser',
      id: 'user123',
      password: 'hashedPassword',
    })
    expect(getUser).toHaveBeenCalled()
  })

  test('should delete a user at /:id', async () => {
    const res = await request(app).delete('/api/users/user123').set('Authorization', 'Bearer fake-jwt-token')

    expect(res.statusCode).toEqual(200)
    expect(res.body).toEqual({
      email: 'test@example.com',
      username: 'testUser',
      id: 'user123',
      password: 'hashedPassword',
    })
    expect(deleteUser).toHaveBeenCalled()
  })
})