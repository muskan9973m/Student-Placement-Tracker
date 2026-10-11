const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { pool } = require('../config/db');

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

async function register(req, res) {
  try {
    const {
      full_name,
      email,
      password,
      confirm_password,
      phone,
      college,
      course,
      branch,
      graduation_year,
      role,
      company_name,
      designation
    } = req.body;

    if (!full_name || !email || !password || !confirm_password || !role) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const allowedRoles = ['student', 'recruiter'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Admin accounts cannot be self-registered' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [userResult] = await connection.query(
        `INSERT INTO users (full_name, email, password, phone, role)
         VALUES (?, ?, ?, ?, ?)`,
        [full_name, email.toLowerCase(), hashed, phone || null, role]
      );

      const userId = userResult.insertId;

      if (role === 'student') {
        await connection.query(
          `INSERT INTO students (user_id, college, course, branch, graduation_year, degree)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [userId, college || null, course || null, branch || null, graduation_year || null, course || null]
        );
      }

      if (role === 'recruiter') {
        let companyId = null;
        if (company_name) {
          const [companyResult] = await connection.query(
            `INSERT INTO companies (name, created_by) VALUES (?, ?)`,
            [company_name, userId]
          );
          companyId = companyResult.insertId;
        }

        await connection.query(
          `INSERT INTO recruiters (user_id, company_id, designation) VALUES (?, ?, ?)`,
          [userId, companyId, designation || null]
        );
      }

      await connection.commit();

      const user = { id: userId, email: email.toLowerCase(), role, full_name };
      const token = signToken(user);

      return res.status(201).json({
        message: 'Registration successful',
        token,
        user
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Registration failed', error: error.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    const user = rows[0];

    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user);
    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Login failed', error: error.message });
  }
}

async function me(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT id, full_name, email, phone, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!rows[0]) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ user: rows[0] });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (!rows[0]) {
      return res.json({
        message: 'If this email exists, a reset token has been generated.',
        note: 'For this mini-project, use the token returned only when the account exists.'
      });
    }

    const token = crypto.randomBytes(24).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await pool.query(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
      [token, expires, rows[0].id]
    );

    return res.json({
      message: 'Password reset token generated. Use it on the reset password page.',
      reset_token: token,
      expires_in: '1 hour'
    });
  } catch (error) {
    return res.status(500).json({ message: 'Forgot password failed', error: error.message });
  }
}

async function resetPassword(req, res) {
  try {
    const { email, reset_token, new_password, confirm_password } = req.body;
    if (!email || !reset_token || !new_password || !confirm_password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (new_password !== confirm_password) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const [rows] = await pool.query(
      `SELECT id FROM users
       WHERE email = ? AND reset_token = ? AND reset_token_expires > NOW()`,
      [email.toLowerCase(), reset_token]
    );

    if (!rows[0]) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const hashed = await bcrypt.hash(new_password, 10);
    await pool.query(
      `UPDATE users
       SET password = ?, reset_token = NULL, reset_token_expires = NULL
       WHERE id = ?`,
      [hashed, rows[0].id]
    );

    return res.json({ message: 'Password reset successful. You can login now.' });
  } catch (error) {
    return res.status(500).json({ message: 'Reset password failed', error: error.message });
  }
}

module.exports = {
  register,
  login,
  me,
  forgotPassword,
  resetPassword
};
