const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

// Configure rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts, please try again later'
});

// JWT configuration
const JWT_SECRET = 'your-jwt-secret-key';
const JWT_REFRESH_SECRET = 'your-refresh-token-secret';

// Token storage (use a database in production)
const tokenBlacklist = new Set();
const refreshTokens = new Set();

// Login route with rate limiting
app.post('/login', loginLimiter, (req, res) => {
  const { username, password } = req.body;
 
  // Authentication logic (simplified)
  if (username !== 'user1' || password !== 'password1') {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
 
  // Generate tokens
  const accessToken = jwt.sign(
    { id: 1, username },
    JWT_SECRET,
    { expiresIn: '15m' } // Short-lived access token
  );
 
  const refreshToken = jwt.sign(
    { id: 1, username },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' } // Longer-lived refresh token
  );
 
  // Store refresh token
  refreshTokens.add(refreshToken);
 
  res.json({
    message: 'Login successful',
    accessToken,
    refreshToken
  });
});

// Refresh token route
app.post('/refresh-token', (req, res) => {
  const { refreshToken } = req.body;
 
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token required' });
  }
 
  // Check if token exists and is not blacklisted
  if (!refreshTokens.has(refreshToken)) {
    return res.status(403).json({ message: 'Invalid refresh token' });
  }
 
  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
   
    // Generate new access token
    const accessToken = jwt.sign(
      { id: decoded.id, username: decoded.username },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
   
    res.json({
      message: 'Token refreshed',
      accessToken
    });
  } catch (error) {
    // Remove invalid refresh token
    refreshTokens.delete(refreshToken);
   
    return res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
});

// JWT verification middleware
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
 
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header required' });
  }
 
  const token = authHeader.split(' ')[1];
 
  // Check if token is blacklisted
  if (tokenBlacklist.has(token)) {
    return res.status(403).json({ message: 'Token revoked' });
  }
 
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Logout route
app.post('/logout', authenticateJWT, (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(' ')[1];
  const { refreshToken } = req.body;
 
  // Blacklist the current access token
  tokenBlacklist.add(token);
 
  // Remove refresh token if provided
  if (refreshToken) {
    refreshTokens.delete(refreshToken);
  }
 
  res.json({ message: 'Logout successful' });
});

// Protected route
app.get('/protected', authenticateJWT, (req, res) => {
  res.json({
    message: 'Protected resource accessed',
    user: req.user
  });
});

// Start server
app.listen(8080, () => {
  console.log('Server running on port 8080');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header required' });
  }

  const token = authHeader.split(' ')[1];

  // Check if token is blacklisted
  if (tokenBlacklist.has(token)) {
    return res.status(403).json({ message: 'Token revoked' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
});

// Logout route
app.post('/logout', authenticateJWT, (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(' ')[1];
  const { refreshToken } = req.body;

  // Blacklist the current access token
  tokenBlacklist.add(token);

  // Remove refresh token if provided
  if (refreshToken) {
    refreshTokens.delete(refreshToken);
  }

  res.json({ message: 'Logout successful' });
});

// Protected route
app.get('/protected', authenticateJWT, (req, res) => {
  res.json({
    message: 'Protected resource accessed',
    user: req.user
  });
});

// Start server
app.listen(8080, () => {
  console.log('Server running on port 8080');
});
