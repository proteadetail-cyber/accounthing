const jwt = require('jsonwebtoken');
const db = require('../db/database');

const JWT_SECRET = process.env.JWT_SECRET || 'sa_accounting_super_secret_jwt_key_2026';
const MASTER_KEY = process.env.MASTER_KEY || 'SA-ACC-MASTER-2026';

/**
 * Express Middleware: Enforces valid JWT token AND active subscription status in database.
 * Rejects expired, cancelled, revoked, or unauthenticated users.
 */
function requireActiveAccess(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : (req.query.token || req.body.token);

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in with a valid Whop license.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    // Master key bypass check
    if (decoded.isMaster || decoded.licenseKey === MASTER_KEY) {
      return next();
    }

    // Database access status lookup
    if (decoded.studentId) {
      const student = db.prepare('SELECT id, license_key, access_status, expires_at FROM students WHERE id = ?').get(decoded.studentId);
      
      if (!student) {
        return res.status(401).json({ error: 'Student session not found. Please re-authenticate.' });
      }

      const status = (student.access_status || 'active').toLowerCase();
      const isExpired = student.expires_at && new Date(student.expires_at) < new Date();

      if (status !== 'active' || isExpired) {
        return res.status(403).json({
          error: isExpired ? 'Your Whop subscription has expired.' : 'Access has been revoked or cancelled on Whop.',
          accessDenied: true,
          status: isExpired ? 'expired' : status
        });
      }
    }

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session token. Please re-verify your Whop license.' });
  }
}

module.exports = {
  requireActiveAccess
};
