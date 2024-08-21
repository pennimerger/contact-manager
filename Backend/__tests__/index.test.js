const dotenv = require("dotenv").config()
const {connectDb, disconnectDb} = require("../config/dbConnection")
const request = require('supertest')

describe("/api/users/me", ()=>{
  let app
  beforeAll(async ()=>{
    await connectDb() 
    app = require("../index")
  })

  test('should return 401 as an unauthenticated user', async()=>{
    const res = await request(app).get('/api/users/me')

    expect(res.statusCode).toBe(401)
    expect(res.body.message).toBe("Unauthorized")
  })

  afterAll(async () => {
    await disconnectDb()
  })
})