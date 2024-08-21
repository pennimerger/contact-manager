const validateToken = require('../middleware/validateTokenHandler')
const jwt = require('jsonwebtoken')

// Mocking jwt.verify
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}))

describe('validateToken middleware', () => {
  let req, res, next

  beforeEach(() => {
    req = {
      headers: {
        authorization: 'Bearer validToken',
      },
    }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }
    next = jest.fn()
  })

  test('should call next if the token is valid', async () => {
    const mockDecoded = { user: {
      email: 'test@example.com',
      username: 'testUser',
      id: 'user123',
      password: 'hashedPassword',
    }}
    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(null, mockDecoded)
    })

    await validateToken(req, res, next)

    expect(jwt.verify).toHaveBeenCalledWith(
      'validToken',
      process.env.ACCESS_TOKEN_SECRET,
      expect.any(Function) // matches any function except null or undefined
    )
    expect(req.user).toEqual(mockDecoded.user)
    expect(next).toHaveBeenCalled()
  })

  test('should return 401 if no token is provided', async () => {
    req.headers.authorization = undefined

    await validateToken(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({message: "Unauthorized"})
    expect(next).not.toHaveBeenCalled()
  })

  test('should return 401 if the token is invalid', async () => {
    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(new Error('Invalid token'), null)
    })

    await validateToken(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({message: "Unauthorized"})
    expect(next).not.toHaveBeenCalled()
  })
})
