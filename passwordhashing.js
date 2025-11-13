const bcrypt = require('bcrypt');
const saltRounds = 10;

// Hashing a password
async function hashPassword(plainPassword) {
  return await bcrypt.hash(plainPassword, saltRounds);
}

// Verifying a password
async function verifyPassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}