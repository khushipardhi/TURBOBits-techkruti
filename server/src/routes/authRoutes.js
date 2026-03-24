const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');
const { registerSchema, loginSchema, validate } = require('../middleware/validator');
const { authLimiter } = require('../middleware/rateLimiter');
const authenticate = require('../middleware/auth');

const router = express.Router();

// ==================== REGISTER ====================
router.post('/register', authLimiter, registerSchema, validate, async (req, res, next) => {
  try {
    const { name, phone, email, password, role, address, pin_code } = req.body;

    // Check if phone already exists
    const [existing] = await db.execute(
      'SELECT user_id FROM users WHERE phone = ? OR (email = ? AND email IS NOT NULL)',
      [phone, email || '']
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, error: 'User with this phone or email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert user (with pin_code)
    const [result] = await db.execute(
      `INSERT INTO users (role, name, phone, email, password_hash, address, pin_code) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [role, name, phone, email || null, password_hash, address || null, pin_code || null]
    );

    const userId = result.insertId;

    // Insert role-specific profile
    if (role === 'DONOR') {
      await db.execute('INSERT INTO donors (donor_id) VALUES (?)', [userId]);
    } else if (role === 'RECEIVER') {
      await db.execute('INSERT INTO receivers (receiver_id) VALUES (?)', [userId]);
    } else if (role === 'VOLUNTEER') {
      await db.execute('INSERT INTO delivery_partners (partner_id) VALUES (?)', [userId]);
    }

    // Generate JWT (include pin_code for location matching)
    const token = jwt.sign(
      { user_id: userId, role, name, email: email || null, pin_code: pin_code || null },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: { user_id: userId, name, phone, email: email || null, role, trust_score: 5.00, is_active: true, address: address || null, pin_code: pin_code || null },
        token,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ==================== LOGIN ====================
router.post('/login', authLimiter, loginSchema, validate, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email or phone
    const [users] = await db.execute(
      'SELECT * FROM users WHERE email = ? OR phone = ?',
      [email, email]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    const user = users[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({ success: false, error: 'Account has been deactivated.' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    // Generate JWT (include pin_code for location matching)
    const token = jwt.sign(
      { user_id: user.user_id, role: user.role, name: user.name, email: user.email, pin_code: user.pin_code || null },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Remove sensitive data
    delete user.password_hash;

    res.json({
      success: true,
      message: 'Login successful',
      data: { user, token },
    });
  } catch (err) {
    next(err);
  }
});
// ==================== GET PROFILE ====================
router.get('/profile', authenticate, async (req, res, next) => {
  try {
    const [users] = await db.execute(
      'SELECT user_id, role, name, phone, email, address, pin_code, trust_score, is_active, created_at FROM users WHERE user_id = ?',
      [req.user.user_id]
    );
    if (users.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    res.json({ success: true, data: users[0] });
  } catch (err) {
    next(err);
  }
});

// ==================== UPDATE PROFILE ====================
router.patch('/profile', authenticate, async (req, res, next) => {
  try {
    const { name, address, pin_code } = req.body;
    const userId = req.user.user_id;

    const updates = [];
    const params = [];

    if (name) { updates.push('name = ?'); params.push(name); }
    if (address !== undefined) { updates.push('address = ?'); params.push(address || null); }
    if (pin_code !== undefined) { updates.push('pin_code = ?'); params.push(pin_code || null); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update.' });
    }

    params.push(userId);
    await db.execute(`UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`, params);

    const [updated] = await db.execute(
      'SELECT user_id, role, name, phone, email, address, pin_code, trust_score, is_active, created_at FROM users WHERE user_id = ?',
      [userId]
    );

    res.json({ success: true, message: 'Profile updated.', data: updated[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
