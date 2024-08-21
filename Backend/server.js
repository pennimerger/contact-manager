const app = require("./index")
const dotenv = require("dotenv").config()

const port = process.env.PORT || 5000 // listen at

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})