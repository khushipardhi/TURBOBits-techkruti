/**
 * PROTOTYPE MODE: Role-based authorization is DISABLED.
 * All roles are accepted regardless of req.user.role.
 * To re-enable, restore the roles.includes() check.
 */

const authorize = (...roles) => {
  return (req, res, next) => {
    // Prototype: skip role check, just pass through
    next();
  };
};

module.exports = authorize;
