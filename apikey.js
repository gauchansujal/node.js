const express = require('express');
const app = express();

// In-memory storage for API keys (use a database in production)
const apiKeys = new Map([
  ['abc123', { name: 'Mobile App', permissions: ['read:data'] }],
  ['def456', { name: 'Web Client', permissions: ['read:data', 'write:data'] }]
]);

// API key authentication middleware
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;

  if (!apiKey) {
    return res.status(401).json({
      error: 'API key is required',
      docs: 'https://your-api-docs.com/authentication'
    });
  }

  const keyData = apiKeys.get(apiKey);
  if (!keyData) {
    return res.status(403).json({ error: 'Invalid API key' });
  }

  // Attach key data to request for use in route handlers
  req.apiKey = keyData;
  next();
};
// Protected route using API key
app.get('/api/data', authenticateApiKey, (req, res) => {
  res.json({
    message: 'Access granted',
    client: req.apiKey.name,
    timestamp: new Date().toISOString()
  });
});

// Route to generate a new API key (protected by admin auth in real apps)
app.post('/api/keys', (req, res) => {
  const { name, permissions } = req.body;
  const apiKey = generateApiKey(); // Implement your key generation logic
  apiKeys.set(apiKey, { name, permissions });
  res.status(201).json({ apiKey });
});
// Helper function to generate API keys
function generateApiKey() {
  return [...Array(32)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('');
}
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// Export for testing
module.exports = { app, apiKeys };