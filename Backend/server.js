const app = require("./index")
const dotenv = require("dotenv").config()
const {connectDb} = require("./config/dbConnection")

const port = process.env.PORT || 5000 // listen at

connectDb() //connect to database

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})