const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'job_finder_jwt_secret_dev_key_2024';

/**
 * Auth middleware — verifies JWT from Authorization header.
 * Attaches decoded { id, email } to req.user on success.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. No token provided.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token.'
    });
  }
}

/**
 * Optional auth middleware — attaches user if token is valid, but doesn't block.
 * Useful for routes that behave differently for authenticated vs anonymous users.
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email };
  } catch (err) {
    req.user = null;
  }

  next();
}

module.exports = { authMiddleware, optionalAuth };
