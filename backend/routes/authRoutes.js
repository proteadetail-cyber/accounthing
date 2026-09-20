const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const { validateWhopAccess, verifyWhopWebhookSignature } = require('../services/whopService');

const JWT_SECRET = process.env.JWT_SECRET || 'sa_accounting_super_secret_jwt_key_2026';
const MASTER_KEY = process.env.MASTER_KEY || 'SA-ACC-MASTER-2026';

// POST /api/auth/license (Whop License & Master Key Verification Endpoint)
router.post('/license', async (req, res) => {
  const { licenseKey, language = 'en' } = req.body;

  if (!licenseKey || typeof licenseKey !== 'string') {
    return res.status(400).json({ error: 'License key is required.' });
  }

  const trimmedKey = licenseKey.trim();
  const isMaster = trimmedKey === MASTER_KEY;

  // 1. Check local pre-seeded licenses table first if master or seeded
  let localLicense = null;
  if (!isMaster) {
    const licStmt = db.prepare('SELECT * FROM licenses WHERE key_code = ? AND is_active = 1');
    localLicense = licStmt.get(trimmedKey);
  }

  // 2. Perform official Whop API License Verification if not master or local seed
  let whopResult = null;
  if (isMaster || localLicense) {
    whopResult = {
      valid: true,
      status: 'active',
      isMaster,
      membershipId: isMaster ? 'master-key' : localLicense.key_code
    };
  } else {
    whopResult = await validateWhopAccess(trimmedKey);
  }

  if (!whopResult.valid) {
    return res.status(401).json({
      error: whopResult.error || 'Invalid or expired Whop license key.',
      status: whopResult.status,
      checkoutUrl: process.env.WHOP_CHECKOUT_URL || 'https://whop.com'
    });
  }

  // 3. Find or create student record in database
  let studentStmt = db.prepare('SELECT * FROM students WHERE license_key = ? OR whop_membership_id = ?');
  let student = studentStmt.get(trimmedKey, whopResult.membershipId || trimmedKey);

  const expiresAt = whopResult.expiresAt || null;

  if (!student) {
    const insertStudent = db.prepare(`
      INSERT INTO students (
        license_key, language, whop_user_id, whop_membership_id,
        whop_product_id, whop_plan_id, access_status, expires_at, last_verified_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    const info = insertStudent.run(
      trimmedKey,
      language,
      whopResult.userId || null,
      whopResult.membershipId || trimmedKey,
      whopResult.productId || null,
      whopResult.planId || null,
      'active',
      expiresAt
    );
    student = {
      id: info.lastInsertRowid,
      license_key: trimmedKey,
      language,
      access_status: 'active'
    };
  } else {
    // Update existing student with fresh verification & login timestamp
    db.prepare(`
      UPDATE students SET 
        last_login = CURRENT_TIMESTAMP, 
        last_verified_at = CURRENT_TIMESTAMP,
        language = ?,
        access_status = 'active',
        expires_at = ?,
        whop_membership_id = COALESCE(?, whop_membership_id)
      WHERE id = ?
    `).run(language, expiresAt, whopResult.membershipId || trimmedKey, student.id);
  }

  // 4. Issue 30-day JWT token
  const token = jwt.sign(
    { 
      studentId: student.id, 
      licenseKey: trimmedKey, 
      isMaster: !!isMaster,
      membershipId: whopResult.membershipId 
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  return res.json({
    message: 'Access granted.',
    token,
    student: {
      id: student.id,
      licenseKey: trimmedKey,
      language: student.language || language,
      isMaster: !!isMaster,
      accessStatus: 'active',
      whopMembershipId: whopResult.membershipId || trimmedKey,
      expiresAt: expiresAt
    }
  });
});

// Google OAuth Sign-In Endpoint
router.post('/google', (req, res) => {
  const { googleToken, profile, language = 'en' } = req.body;

  let email = '';
  let name = '';
  let picture = '';
  let googleId = '';

  if (googleToken && typeof googleToken === 'string') {
    try {
      const parts = googleToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
        googleId = payload.sub || '';
        email = payload.email || '';
        name = payload.name || '';
        picture = payload.picture || '';
      }
    } catch (e) {
      console.error('Failed to parse googleToken:', e);
    }
  }

  if (profile) {
    googleId = googleId || profile.googleId || profile.sub || profile.id || '';
    email = email || profile.email || '';
    name = name || profile.name || '';
    picture = picture || profile.picture || profile.avatar || '';
  }

  if (!email && !googleId) {
    return res.status(400).json({ error: 'Valid Google user identity required.' });
  }

  const lookupKey = googleId || email;
  let studentStmt = db.prepare('SELECT * FROM students WHERE google_id = ? OR email = ?');
  let student = studentStmt.get(lookupKey, email || lookupKey);

  if (!student) {
    const licenseKey = `GOOGLE_${googleId ? googleId.substring(0, 12) : Date.now()}`;
    const insertStudent = db.prepare(
      'INSERT INTO students (license_key, language, email, name, picture, google_id, access_status) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    const info = insertStudent.run(licenseKey, language, email, name, picture, lookupKey, 'active');
    student = {
      id: info.lastInsertRowid,
      license_key: licenseKey,
      language,
      email,
      name,
      picture,
      google_id: lookupKey,
      access_status: 'active'
    };
  } else {
    db.prepare('UPDATE students SET last_login = CURRENT_TIMESTAMP, name = ?, picture = ?, email = ? WHERE id = ?')
      .run(name || student.name || '', picture || student.picture || '', email || student.email || '', student.id);
  }

  const token = jwt.sign(
    { studentId: student.id, email: student.email, isGoogle: true },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  return res.json({
    message: 'Google Sign-In successful.',
    token,
    student: {
      id: student.id,
      licenseKey: student.license_key || 'GOOGLE_AUTH',
      language: student.language || 'en',
      isMaster: false,
      email: student.email || email,
      name: student.name || name || (email ? email.split('@')[0] : 'Google Student'),
      picture: student.picture || picture,
      isGoogle: true,
      accessStatus: 'active'
    }
  });
});

// POST /api/auth/whop-webhook (Real-Time Subscription Lifecycle Webhook Handler)
router.post('/whop-webhook', (req, res) => {
  const secret = process.env.WHOP_WEBHOOK_SECRET;
  const rawBody = JSON.stringify(req.body);

  // Signature verification
  const isValidSig = verifyWhopWebhookSignature(rawBody, req.headers, secret);
  if (!isValidSig) {
    console.warn('[Whop Webhook Rejected] Invalid signature');
    return res.status(401).json({ error: 'Invalid webhook signature.' });
  }

  const event = req.body || {};
  const action = (event.action || event.event || event.type || '').toLowerCase();
  const data = event.data || event;

  const membershipId = data.id || data.membership_id;
  const userId = data.user_id;
  const productId = data.product_id;

  console.log(`[Whop Webhook Received] Action: ${action}, Membership: ${membershipId}`);

  if (membershipId) {
    if (action.includes('went_valid') || action.includes('created') || action.includes('updated')) {
      // Activate access
      db.prepare(`
        UPDATE students SET 
          access_status = 'active',
          last_verified_at = CURRENT_TIMESTAMP
        WHERE whop_membership_id = ? OR license_key = ?
      `).run(membershipId, membershipId);
    } else if (action.includes('went_invalid') || action.includes('canceled') || action.includes('deleted') || action.includes('expired')) {
      // Revoke access
      db.prepare(`
        UPDATE students SET 
          access_status = 'revoked',
          last_verified_at = CURRENT_TIMESTAMP
        WHERE whop_membership_id = ? OR license_key = ?
      `).run(membershipId, membershipId);
    }
  }

  return res.json({ received: true, action });
});

// GET /api/auth/session (Session Status Verification)
router.get('/session', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : req.query.token;

  if (!token) {
    return res.status(401).json({ valid: false, error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.isMaster || decoded.licenseKey === MASTER_KEY) {
      return res.json({ valid: true, accessStatus: 'active', isMaster: true });
    }

    const student = db.prepare('SELECT id, license_key, access_status, expires_at FROM students WHERE id = ?').get(decoded.studentId);
    if (!student) {
      return res.status(404).json({ valid: false, error: 'Student not found' });
    }

    const isExpired = student.expires_at && new Date(student.expires_at) < new Date();
    const status = isExpired ? 'expired' : (student.access_status || 'active');

    return res.json({
      valid: status === 'active',
      accessStatus: status,
      expiresAt: student.expires_at
    });
  } catch (e) {
    return res.status(401).json({ valid: false, error: 'Token expired or invalid' });
  }
});

module.exports = router;
