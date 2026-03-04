# 📓 My Personal Notes — Bank Transaction System
> **This file is just for me (future Yashwanth). Written in simple English so I can remember what I built and why.**

---

## 🏦 What Is This Project?

This is a **backend API** for a Bank Transaction System.

Think of it like the engine behind a banking app. It doesn't have any screens or buttons — it just receives requests (from Postman, or a frontend app), processes them, and sends back data.

Right now, it handles **user authentication** — meaning it lets users:
- **Register** (create an account)
- **Login** (access their account)

More features like transactions, balance checks, etc. will come later.

---

## 🗂️ Folder Structure (What Each File Does)

```
BankTransactionSystem/
│
├── server.js              ← Starts the server (entry point)
├── package.json           ← Lists all packages/tools used
├── .env                   ← Secret keys (NOT pushed to GitHub)
├── .gitignore             ← Tells Git what NOT to upload
├── MY_NOTES.md            ← This file (my personal notes)
│
└── src/
    ├── app.js             ← Sets up Express, middleware, and routes
    ├── config/
    │   └── db.js          ← Connects to MongoDB database
    ├── models/
    │   └── user.model.js  ← Defines what a User looks like in the database
    ├── routes/
    │   └── auth.routes.js ← Defines which URL goes to which controller
    └── controllers/
        └── auth.controller.js ← The actual logic for register and login
```

---

## 🧱 What Each Important File Does (In Simple Words)

### `server.js` — The Starter
This is the **first file that runs** when I type `npm run dev`.

It does only two things:
1. Connects to the MongoDB database
2. Starts the Express server on **port 3000**

It keeps `server.js` very clean and simple — all the real setup is in `app.js`.

---

### `src/app.js` — The Setup File
This is where the Express app is **configured**.

It does:
1. Creates the Express app
2. Tells Express to **read JSON from request body** (`express.json()`)
3. Tells Express to **read cookies** (`cookieParser()`)
4. **Registers the routes** — so `/api/auth/...` routes work

> ⚠️ **Important lesson I learned:** Middleware (like `express.json()`) MUST be added BEFORE the routes. If you add it after, `req.body` will be `undefined` and nothing will work.

---

### `src/models/user.model.js` — The User Blueprint
This file defines what a **User** looks like when saved in MongoDB.

Every user has:
| Field | What it is |
|-------|-----------|
| `email` | Must be a valid email, unique, stored in lowercase |
| `name` | The user's name, required |
| `password` | Must be strong (see rules below), never returned in queries by default |
| `createdAt` / `updatedAt` | Added automatically by `timestamps: true` |

**Password Rules (the regex):**
- At least 8 characters
- At least 1 UPPERCASE letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character from: `@ $ ! % * ? &`
- ⚠️ Note: `#` is NOT allowed!

**Two special features this model has:**

1. **Auto-hashing before save** (`pre("save")` hook)
   - Before any user is saved to the database, the password is automatically converted to a hashed (scrambled) version using `bcrypt`
   - This means the real password is NEVER stored in the database — only the scrambled version
   - If someone hacks the database, they can't read the passwords

2. **comparePassword method**
   - Used during login to check if the password the user typed matches the hashed password in the database
   - We can't just compare them directly (because the stored one is scrambled), so `bcrypt.compare()` does this smartly

---

### `src/routes/auth.routes.js` — The Traffic Controller
This file tells Express: **"When this URL is called, go to this controller function."**

```
POST /api/auth/register  →  userRegisterController
POST /api/auth/login     →  userLoginController
```

It uses `express.Router()` to keep routes organized and separate from the main app.

---

### `src/controllers/auth.controller.js` — The Brain
This is where the **actual logic** lives.

#### `userRegisterController` — Handles Registration
When someone sends a POST request to `/api/auth/register`:

1. Reads `email`, `password`, `name` from the request body
2. Checks if a user with that email already exists in the database
3. If yes → returns error: "User already exists"
4. If no → creates the new user in the database
5. Generates a **JWT token** (like a session pass) that expires in 1 day
6. Saves the token in a **cookie** on the user's browser
7. Returns the user info + token as JSON

#### `userLoginController` — Handles Login
When someone sends a POST request to `/api/auth/login`:

1. Reads `email` and `password` from the request body
2. Finds the user in the database by email
   - Uses `.select("+password")` because password is hidden by default
3. If user not found → returns error: "User not found"
4. If found → uses `comparePassword()` to check if password is correct
5. If password wrong → returns error: "Invalid password"
6. If correct → generates JWT token, sets cookie, returns user + token

---

## 📦 Packages Used (and Why)

| Package | What It Does |
|---------|-------------|
| `express` | The main web framework — handles HTTP requests/responses |
| `mongoose` | Connects to MongoDB and lets me define data models |
| `bcryptjs` | Hashes (scrambles) passwords before saving them |
| `jsonwebtoken` | Creates JWT tokens for user sessions after login |
| `cookie-parser` | Reads cookies sent in HTTP requests |
| `dotenv` | Reads `.env` file so I can use secret keys safely |
| `nodemon` | Automatically restarts the server when I save a file (dev only) |

---

## 🔐 What is a JWT Token?

JWT = **JSON Web Token**

Think of it like a **stamp on your hand at an event**. Once you register or login, the server gives you this stamp (token). Every time you want to do something (like check your balance), you show this stamp and the server trusts you without asking for your password again.

The token:
- Contains your user ID (`userID: user._id`)
- Is signed with a secret key (`JWT_SECRET` from `.env`)
- Expires after **1 day**

---

## 🚨 Bugs I Fixed During Development

### Bug 1 — `app is not defined` (in auth.routes.js)
**What happened:** The routes file was doing `module.exports = app` but `app` was never defined there.

**Why it happened:** Copy-paste mistake or confusion. The routes file creates a `router`, not an `app`.

**Fix:** Changed `module.exports = app` → `module.exports = router`

---

### Bug 2 — `cookieParser` was imported from wrong place (in app.js)
**What happened:** `cookie-parser` was being required from `./routes/auth.routes` instead of the actual npm package.

**Why it happened:** Copy-paste mistake.

**Fix:** Changed `require("./routes/auth.routes")` → `require("cookie-parser")`

---

### Bug 3 — Route typo `/regiter` instead of `/register`
**What happened:** The route was spelled wrong as `/regiter`. So when Postman sent a request to `/api/auth/register`, Express couldn't find it and returned **404 Not Found**.

**Why it happened:** Typing mistake.

**Fix:** Changed `"/regiter"` → `"/register"`

---

### Bug 4 — `req.body` was `undefined` (500 Internal Server Error)
**What happened:** The controller was crashing because `req.body` was undefined. This caused a `TypeError: Cannot destructure property 'email' of 'req.body' as it is undefined`.

**Why it happened:** In `app.js`, the `express.json()` middleware was added AFTER the routes. So when a request came in, Express tried to run the route handler BEFORE it knew how to read JSON — meaning `req.body` was empty.

**Fix:** Moved `app.use(express.json())` and `app.use(cookieParser())` to BEFORE `app.use("/api/auth", authRouter)`

---

### Bug 5 — `jwt.sign()` called with wrong arguments
**What happened:** `res.cookie()` and `res.status().json()` were accidentally placed inside the `jwt.sign()` call as extra arguments. JavaScript treated them as `jwt.sign()` parameters, not as response calls.

**Why it happened:** Bad code structure — the response code was placed in the wrong location.

**Fix:** Moved the response code (`res.cookie()` and `res.status(201).json()`) to AFTER `jwt.sign()` completes.

---

### Bug 6 — `userLoginController` not exported
**What happened:** The login route was added to `auth.routes.js`, but the login controller function was never added to `module.exports`. So when Express tried to use it, the function was `undefined` → crashed with `TypeError: argument handler must be a function`.

**Fix:** Added `userLoginController` to the `module.exports` object.

---

### Bug 7 — Wrong method name `user.isValidPassword()` 
**What happened:** The login controller called `user.isValidPassword(password)` but that method doesn't exist on the model. The actual method is named `comparePassword`.

**Fix:** Changed `user.isValidPassword(password)` → `user.comparePassword(password)`

---

### Bug 8 — No `try/catch` in controllers
**What happened:** Any error (database error, validation error, etc.) would crash the server and return an ugly 500 HTML error page instead of a proper JSON error message.

**Fix:** Wrapped all controller logic inside `try { ... } catch(error) { ... }` so errors are caught and returned as clean JSON.

---

### Bug 9 — Password not selected during login
**What happened:** When finding a user for login, the password field wasn't being returned from the database. This is because the model has `select: false` on the password field (for security). So `comparePassword()` was comparing against `undefined`.

**Fix:** Added `.select("+password")` to the `findOne()` query in the login controller.

---

## 🧪 How to Test in Postman

### Register a New User
- **Method:** POST
- **URL:** `http://localhost:3000/api/auth/register`
- **Header:** `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
    "email": "yourname@gmail.com",
    "password": "YourPass@123",
    "name": "Your Name"
}
```
- **Expected:** `201 Created` with user info and token

---

### Login
- **Method:** POST
- **URL:** `http://localhost:3000/api/auth/login`
- **Header:** `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
    "email": "yourname@gmail.com",
    "password": "YourPass@123"
}
```
- **Expected:** `200 OK` with user info and token

> ⚠️ You MUST register first before you can login!

---

## 🔑 Password Rules (Always Remember!)

Your password MUST have:
- ✅ At least 8 characters
- ✅ At least 1 UPPERCASE letter (e.g., `Y`)
- ✅ At least 1 lowercase letter (e.g., `our`)
- ✅ At least 1 number (e.g., `123`)
- ✅ At least 1 special character from: `@ $ ! % * ? &`
- ❌ The `#` character is NOT allowed

**Valid example:** `Yashwanth@123`
**Invalid:** `yashwanth@123` (no uppercase), `Yashwanth@#123` (has #)

---

## 🚀 How to Run the Project

```bash
# Install packages (only first time)
npm install

# Run in development mode (auto-restarts on save)
npm run dev

# Run in production mode
npm start
```

Server will start at: **http://localhost:3000**

---

## 🔒 .env File (Secret Keys)

The `.env` file contains sensitive information and is **NOT uploaded to GitHub**.

It has:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

If you ever clone this project on a new computer, you need to create this `.env` file manually.

---

## 📅 Progress Timeline

| Date | What Was Done |
|------|--------------|
| Session 1 | Project set up, server.js, app.js, routes, model created |
| Session 2 | Fixed `app is not defined` bug in auth.routes.js |
| Session 2 | Fixed `cookieParser` wrong import in app.js |
| Session 2 | Fixed route typo `/regiter` → `/register` (was causing 404) |
| Session 2 | Fixed middleware order (was causing `req.body` to be undefined) |
| Session 2 | Fixed `jwt.sign()` wrong arguments (was causing 500 errors) |
| Session 2 | Added `try/catch` to both controllers for proper error handling |
| Session 2 | Added login route + controller |
| Session 2 | Fixed `isValidPassword` → `comparePassword` (wrong method name) |
| Session 2 | Fixed missing `.select("+password")` in login query |
| Session 2 | Added `userLoginController` to `module.exports` |
| Session 2 | Pushed code to GitHub |

---

