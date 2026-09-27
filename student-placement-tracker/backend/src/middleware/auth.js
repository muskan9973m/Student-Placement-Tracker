const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied for this role' });
    }
    next();
  };
}

async function getStudentByUserId(userId) {
  const [rows] = await pool.query('SELECT * FROM students WHERE user_id = ?', [userId]);
  return rows[0] || null;
}

async function getRecruiterByUserId(userId) {
  const [rows] = await pool.query('SELECT * FROM recruiters WHERE user_id = ?', [userId]);
  return rows[0] || null;
}

module.exports = {
  authenticate,
  authorize,
  getStudentByUserId,
  getRecruiterByUserId
};
