// Unit testing each controller
const {registerUser, loginUser, getUser, deleteUser} = require("../../controllers/userController")
const User = require("../../models/userModel")
const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt')

// .mockResolvedValue = mocking the resolved promise.
// .mockReturnValue = mocking the return value from func.

// mocks to control jwt, bcrypt and user model behaviours
jest.mock('bcrypt')
jest.mock("jsonwebtoken")
jest.mock('../../models/userModel')

// register
describe('test registerUser Controller', () => {
  let req, res, next

  beforeEach(() => {
    req = {
      body: {}
    }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    // to handle errors in asynchronous handlers
    next = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should throw an error if username, email, or password is missing', async () => {
    // Arrange
    req.body = { username: '', email: '', password: '' }

    // Act
    await registerUser(req, res, next)

    // Assert
    expect(res.status).toHaveBeenCalledWith(400)
    expect(next).toHaveBeenCalledWith(new Error("All fields are mandatory!"))
  })

  test('should throw an error if user already exists', async () => {
    req.body = { username: 'testuser', email: 'test@example.com', password: 'password' }
    User.findOne.mockResolvedValue({ email: 'test@example.com' })

    await registerUser(req, res, next)

    expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' })
    expect(res.status).toHaveBeenCalledWith(400)
    expect(next).toHaveBeenCalledWith(new Error("User already registered!"))
  })

  test('should create a new user if data is valid', async () => {
    req.body = { username: 'testuser', email: 'test@example.com', password: 'password' }
    User.findOne.mockResolvedValue(null)
    bcrypt.hash.mockResolvedValue('hashedpassword')
    User.create.mockResolvedValue({
      id: 'user123',
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
    })

    await registerUser(req, res, next)

    expect(bcrypt.hash).toHaveBeenCalledWith('password', 10)
    expect(User.create).toHaveBeenCalledWith({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
    })
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({ _id: 'user123', email: 'test@example.com' })
  })

  test('should throw an error if user creation fails', async () => {
    req.body = { username: 'testuser', email: 'test@example.com', password: 'password' }
    User.findOne.mockResolvedValue(null)
    bcrypt.hash.mockResolvedValue('hashedpassword')
    User.create.mockResolvedValue(null)

    await registerUser(req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(next).toHaveBeenCalledWith(new Error("User data is not valid"))
  })
})

// login
describe("test loginUser controller", ()=>{
  let req, res, next

  beforeEach(() => {
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

  test('should throw an error and return 400 if email, or password is missing', async () => {
    req.body = { email: '', password: '' }

    await loginUser(req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(next).toHaveBeenCalledWith(new Error("All fields are mandatory!"))
  })

  test("should return 401 if the user is not found", async()=>{
    req.body = {email: "test@example.com", password:"password"}
    User.findOne.mockResolvedValue(null)

    await loginUser(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).toHaveBeenCalledWith(new Error("Invalid email or password"))
  })

  test("should return 401 if the password is incorrect", async()=>{
    req.body = {email: "test@example.com", password:"password"}
    User.findOne.mockResolvedValue({email:"test@example.com", password:"hashedpassword"})
    bcrypt.compare.mockResolvedValue(false)

    await loginUser(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).toHaveBeenCalledWith(new Error("Invalid email or password"))
  })

  test("should return 200 and a JWT token for successful login", async()=>{
    req.body = {email: 'test@example.com', password: 'password' }
    const user = {
      email: 'test@example.com',
      username: 'testUser',
      id: 'user123',
      password: 'hashedPassword',
    }
    User.findOne.mockResolvedValue(user)
    bcrypt.compare.mockResolvedValue(true)
    jwt.sign.mockReturnValue("Token")

    await loginUser(req, res, next)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({accessToken: "Token"})
    expect(jwt.sign).toHaveBeenCalledWith(
      { user: { username: 'testUser', email: 'test@example.com', id: 'user123' } },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '50m' }
    )
  })
})

// getUser
describe("test getUser controller", ()=>{
  let req, res

  beforeEach(()=>{
    req = {}
    res = {
      status:jest.fn().mockReturnThis(),
      json: jest.fn()
    }
  })

  test('should return the user and status 200', async () => {
    req.user = {
      email: 'test@example.com',
      username: 'testUser',
      id: 'user123',
      password: 'hashedPassword',
    }

    await getUser(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(req.user)
  })
})

// deleteUser
describe('test deleteUser controller', () => {
  let req, res, next

  beforeEach(() => {
    req = { params: { id: 'user123' } }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }
    next = jest.fn()
  })

  test('should delete the user and return status 200 with the user data', async () => {
    const user = {
      email: 'test@example.com',
      username: 'testUser',
      id: 'user123',
      password: 'hashedPassword',
    }

    User.findById.mockResolvedValue(user)
    User.findOneAndDelete.mockResolvedValue(user)

    await deleteUser(req, res, next)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(user)
  })

  test('should return 404 if the user does not exist', async () => {
    User.findById.mockResolvedValue(null)

    await deleteUser(req, res, next)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(next).toHaveBeenCalledWith(new Error('Non existent'))
  })
})