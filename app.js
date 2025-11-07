const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();

// Parse request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure sessions
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Sample user database
const users = [
  { id: 1, username: 'user1', password: 'password1' }
];

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
 
  // Find user
  const user = users.find(u => u.username === username && u.password === password);
 
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
 
  // Store user information in session (excluding password)
  req.session.user = {
    id: user.id,
    username: user.username
  };
 
  res.json({ message: 'Login successful', user: req.session.user });
});

// Protected route
app.get('/profile', (req, res) => {
  // Check if user is logged in
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
 
  res.json({ message: 'Profile accessed', user: req.session.user });
});

// Logout route
app.post('/logout', (req, res) => {
  // Destroy session
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.json({ message: 'Logout successful' });
  });
});

// Start server
app.listen(8080, () => {
  console.log(`Server running on port  http://localhost:${8080}`);
});