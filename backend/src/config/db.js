const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'placement_tracker',
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true
});

async function testConnection() {
  const connection = await pool.getConnection();
  connection.release();
  return true;
}

module.exports = { pool, testConnection };
