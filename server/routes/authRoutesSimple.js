const express = require('express');
const {
  register,
  login,
  getProfile,
  updateProfile,
  logout
} = require('../controllers/authControllerSimple');
const { authenticate } = require('../middleware/authSimple');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.use(authenticate); // All routes below require authentication
router.post('/logout', logout);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

module.exports = router;