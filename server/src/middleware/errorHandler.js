/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);
  console.error(err.stack);

  // Validation errors from express-validator
  if (err.type === 'validation') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: err.errors,
    });
  }

  // MySQL duplicate entry
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      error: 'A record with this information already exists.',
    });
  }

  // MySQL foreign key constraint
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      success: false,
      error: 'Referenced record does not exist.',
    });
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
};

module.exports = errorHandler;
