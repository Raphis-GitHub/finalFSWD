const express = require('express');
const {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
  getProfile,
  updateProfile,
  changePassword,
  getSessions,
  revokeSession
} = require('../controllers/authController');
const { authenticate, checkAccountLock } = require('../middleware/auth');
const { userValidation } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', userValidation.register, register);
router.post('/login', userValidation.login, checkAccountLock, login);
router.post('/refresh-token', refreshToken);

// Protected routes
router.use(authenticate); // All routes below require authentication

router.post('/logout', logout);
router.post('/logout-all', logoutAll);
router.get('/profile', getProfile);
router.put('/profile', userValidation.updateProfile, updateProfile);
router.put('/change-password', [
  userValidation.login[1], // password validation
  ...userValidation.login.slice(-1) // validation error handler
], changePassword);
router.get('/sessions', getSessions);
router.delete('/sessions/:sessionId', revokeSession);

module.exports = router;