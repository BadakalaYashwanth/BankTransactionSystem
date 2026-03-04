const express = require("express")
const app = express()
const authRouter = require("./routes/auth.routes")
const cookieParser = require("cookie-parser")

// Middleware must come BEFORE routes so req.body is parsed
app.use(express.json())
app.use(cookieParser())

// Routes
app.use("/api/auth", authRouter)

module.exports = app