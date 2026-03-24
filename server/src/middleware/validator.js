const { body, param, validationResult } = require('express-validator');

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ==================== VALIDATION SCHEMAS ====================

const registerSchema = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required')
    .matches(/^[0-9]{10}$/).withMessage('Phone must be 10 digits'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['DONOR', 'RECEIVER', 'VOLUNTEER']).withMessage('Invalid role'),
  body('address').optional().trim(),
];

const loginSchema = [
  body('email').notEmpty().withMessage('Email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const createFoodSchema = [
  body('food_type').isIn(['VEG', 'NON_VEG', 'MIXED']).withMessage('Invalid food type'),
  body('description').trim().notEmpty().withMessage('Description is required')
    .isLength({ max: 500 }).withMessage('Description too long'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('hygiene_confirmed').isBoolean().withMessage('Hygiene confirmation required'),
  body('pickup_address').optional().trim(),
];

const createRequestSchema = [
  body('food_id').isInt({ min: 1 }).withMessage('Valid food ID required'),
];

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  createFoodSchema,
  createRequestSchema,
};
