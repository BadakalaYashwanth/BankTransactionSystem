// Import the Express application from the app module
const app = require("./src/app");
const connectionToDB  = require("./src/config/db")

connectionToDB()

// Start the server on port 3000
// This file is responsible only for starting the server.
// The main Express configuration (routes, middleware, etc.) is defined in app.js and exported from there.
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});