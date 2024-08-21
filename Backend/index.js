const errorHandler = require("./middleware/errorHandler")
const express = require("express") // express server instance
const dotenv = require("dotenv").config()
const connectDb = require("./config/dbConnection")

const app = express() // create app

connectDb() //connect to database

// middleware
app.use(express.json()) // parse data-streams received from client to server side
app.use("/api/contacts", require("./routes/contactRoutes")) // handle routes rendering
app.use("/api/users", require("./routes/userRoutes"))
app.use(errorHandler)

module.exports = app