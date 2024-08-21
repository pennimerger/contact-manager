const errorHandler = require("./middleware/errorHandler")
const express = require("express") // express server instance

const app = express() // create app

// middleware
app.use(express.json()) // parse data-streams received from client to server side
app.use("/api/contacts", require("./routes/contactRoutes")) // handle routes rendering
app.use("/api/users", require("./routes/userRoutes"))
app.use(errorHandler)

module.exports = app