const mongoose = require("mongoose")

const connectDb = async () => {
  try {
    const connect = await mongoose.connect(process.env.CONNECTION_STRING)
    console.log(
      "Database connected: ",
      connect.connection.host,
      connect.connection.name
    )
  } catch (err) {
    console.log(err)
    process.exit(1) // termination due to error
  }
}

const disconnectDb = async () => {
  try {
    await mongoose.disconnect()
    console.log("Database disconnected.")
  } catch (err) {
    console.log("Error during disconnection:", err)
  }
}

module.exports = { connectDb, disconnectDb }