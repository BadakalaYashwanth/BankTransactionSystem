const express = require("express")
const app = express()
const authRouter = require("./routes/auth.routes")
const cookieParser = require("cookie-parser")


app.use("/api/auth", authRouter)
app.use(express.json())
app.use(cookieParser())

module.exports = app 