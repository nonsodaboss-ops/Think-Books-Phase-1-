const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

// Registration
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).send("User registered successfully!");
  } catch (err) {
    res.status(500).send("Error registering user: " + err.message);
  }
});

module.exports = router;

// Login with sessions
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("Invalid credentials");

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Invalid credentials");

    // Store user info in session
    req.session.userId = user._id;
    res.send("Login successful!");
  } catch (err) {
    res.status(500).send("Error logging in: " + err.message);
  }
});

// Logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send("Error logging out");
    res.send("Logged out successfully!");
  });
});

// Middleware to protect routes f
function sessionAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).send("Access denied. Please log in.");
  }
  next();
}

// Protected route
router.get("/dashboard", sessionAuth, (req, res) => {
  res.send("Welcome to your dashboard!");
});
router.get("/profile", sessionAuth, (req, res) => {
  res.send(`Your profile info: User ID = ${req.session.userId}`);
});
router.get("/settings", sessionAuth, (req, res) => {
  res.send("Here you can update your settings.");
});
module.exports = router;

// Logout route
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Error logging out');
    }
    res.clearCookie('connect.sid'); // optional: clears the session cookie
    res.redirect('/login'); // send user back to login page });
  });
});
