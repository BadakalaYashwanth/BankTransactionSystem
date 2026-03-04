require("dotenv").config()
const mongoose = require("mongoose")

function connectionToDB(){
    mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("SERVER CONNECTED: MongoDB")
    })
    .catch(err => {
        console.log("SERVER CONNECTION ERROR: MonggoDB ")
        process.exit(1)
    })
}

module.exports = connectionToDB