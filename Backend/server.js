const errorHandler = require("./middleware/errorHandler")
const dotenv = require("dotenv").config()
const express = require("express") // express server instance
const connectDb = require("./config/dbConnection")
const app = express() // create app
const port = process.env.PORT || 5000 // listen at

connectDb() //connect to database

// middleware
app.use(express.json()) // parse data-streams received from client to server side
app.use("/api/contacts", require("./routes/contactRoutes")) // handle routes rendering
app.use("/api/users", require("./routes/userRoutes"))
app.use(errorHandler)

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})