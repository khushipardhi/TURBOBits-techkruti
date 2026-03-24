/**
 * Role-based authorization middleware
 * Must be used AFTER authenticate middleware
 * @param  {...string} roles - Allowed roles (e.g., 'DONOR', 'ADMIN')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required roles: ${roles.join(', ')}`,
      });
    }
    next();
  };
};

module.exports = authorize;
