require('dotenv').config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT) || 8000,
  JWT_SECRET: process.env.JWT_SECRET || 'default-secret-change-this',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
