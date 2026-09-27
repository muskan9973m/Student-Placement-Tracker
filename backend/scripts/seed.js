require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../src/config/db');

async function seed() {
  const email = (process.env.ADMIN_EMAIL || 'admin@college.edu').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'Admin@123';
  const name = process.env.ADMIN_NAME || 'Placement Officer';

  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length) {
    console.log('Admin already exists:', email);
    process.exit(0);
  }

  const hashed = await bcrypt.hash(password, 10);
  await pool.query(
    `INSERT INTO users (full_name, email, password, phone, role)
     VALUES (?, ?, ?, ?, 'admin')`,
    [name, email, hashed, '9999999999']
  );

  console.log('Admin created successfully');
  console.log('Email:', email);
  console.log('Password:', password);
  process.exit(0);
}

seed().catch((error) => {
  console.error('Seed failed:', error.message);
  process.exit(1);
});
