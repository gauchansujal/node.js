

const bcrypt = require('bcrypt');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

// In-memory user database
const users = [];

// Register route with password hashing
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
   
    // Check if username already exists
    if (users.find(u => u.username === username)) {
      return res.status(400).json({ message: 'Username already taken' });
    }
   
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
   
    // Create new user
    const newUser = {
      id: users.length + 1,
      username,
      password: hashedPassword
    };
   
    users.push(newUser);
   
    res.status(201).json({
      message: 'User registered successfully',
      userId: newUser.id
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Login route with password comparison
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
   
    // Find user
    const user = users.find(u => u.username === username);
   
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
   
    // Compare password with stored hash
    const passwordMatch = await bcrypt.compare(password, user.password);
   
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
   
    // In a real app, generate and return a token
    res.json({
      message: 'Login successful',
      userId: user.id
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Start server
app.listen(8080, () => {
  console.log('Server running on port 8080');
});