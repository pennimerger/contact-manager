const mongoose = require("mongoose")
const {connectDb} = require("../config/dbConnection")

jest.mock("mongoose")

describe("connectDb", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    console.log = jest.fn() // Mock console.log
    process.exit = jest.fn() // Mock process.exit
  })

  test("should connect to the database and log the host and name", async () => {
    const mockConnection = {
      connection: {
        host: "mockHost",
        name: "mockDbName",
      },
    }

    mongoose.connect.mockResolvedValue(mockConnection)

    await connectDb()

    expect(mongoose.connect).toHaveBeenCalledWith(process.env.CONNECTION_STRING)
    expect(console.log).toHaveBeenCalledWith(
      "Database connected: ",
      "mockHost",
      "mockDbName"
    )
  })

  test("should log an error and exit the process if connection fails", async () => {
    const mockError = new Error("Connection failed")
    mongoose.connect.mockRejectedValue(mockError)

    await connectDb()

    expect(mongoose.connect).toHaveBeenCalledWith(process.env.CONNECTION_STRING)
    expect(console.log).toHaveBeenCalledWith(mockError)
    expect(process.exit).toHaveBeenCalledWith(1)
  })
})
