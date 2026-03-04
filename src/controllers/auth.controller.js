const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")

/**
 * User Register Controller
 * Route: POST /api/auth/register
 */
async function userRegisterController(req, res) {
    try {
        // Get data from request body
        const { email, password, name } = req.body

        // Check if user already exists in database
        const isExists = await userModel.findOne({ email })

        // If user already exists, return error
        if (isExists) {
            return res.status(422).json({
                message: "User already exists with this email",
                status: "failed"
            })
        }

        // Create new user
        const user = await userModel.create({
            email,
            password,
            name
        })

        // Generate JWT token
        const token = jwt.sign(
            { userID: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        // Set token in cookie
        res.cookie("token", token)

        // Send success response
        return res.status(201).json({
            user: {
                _id: user._id,
                email: user.email,
                name: user.name
            },
            token
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Internal server error",
            status: "failed"
        })
    }
}



/**
 * - User login Controller
 * - Route: POST /api/auth/login
 */

async function userLoginController(req, res) {
    try {
        const { email, password } = req.body

        // Check if user exists in database
        const user = await userModel.findOne({ email }).select("+password")

        if (!user) {
            return res.status(401).json({
                message: "User not found",
                status: "failed"
            })
        }

        // comparePassword matches the method defined in user.model.js
        const isValidPassword = await user.comparePassword(password)

        if (!isValidPassword) {
            return res.status(401).json({
                message: "Invalid password",
                status: "failed"
            })
        }

        // Generate JWT token
        const token = jwt.sign(
            { userID: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        // Set token in cookie
        res.cookie("token", token)

        // Send success response
        return res.status(200).json({
            user: {
                _id: user._id,
                email: user.email,
                name: user.name
            },
            token
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Internal server error",
            status: "failed"
        })
    }
}
// Export controllers
module.exports = {
    userRegisterController,
    userLoginController
}