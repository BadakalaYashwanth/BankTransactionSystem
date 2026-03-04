const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
{
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        lowercase: true,
        match: [
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            "Invalid Email, Please Check"
        ],
        unique: true
    },

    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true
    },

    password: {
        type: String,
        required: [true, "Password is required"],
        match: [
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            "Password must contain 8 characters, one uppercase, one lowercase, one number, and one special character"
        ],
        select: false
    }
},
{
    timestamps: true
}
);


// Hash password before saving
userSchema.pre("save", async function (next) {

    if (!this.isModified("password")) {
        return next();
    }

    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;

    next();
});


// Compare password method
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

const usermodel = mongoose.model("user", userSchema)
model.exports = usermodel