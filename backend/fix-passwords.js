const bcrypt = require('bcrypt');
const db = require('./src/config/db');

async function updatePasswords() {
  try {
    // Generates a real bcrypt hash for 'demo123'
    const realHash = await bcrypt.hash('demo123', 10); 

    // Updates all existing users in your database with this real hash
    await db.query('UPDATE users SET password_hash = $1', [realHash]);

    console.log('Success! All user passwords are now correctly hashed as: demo123');
    process.exit();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

updatePasswords();
