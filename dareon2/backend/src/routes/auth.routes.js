const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  verifyEmail
} = require('../controllers/auth.controller');

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.get('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:token', resetPassword);
router.get('/verify-email/:token', verifyEmail);

// OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);

router.get('/microsoft',
  passport.authenticate('microsoft', {
    scope: ['user.read', 'calendars.read', 'mail.read']
  })
);

router.get('/microsoft/callback',
  passport.authenticate('microsoft', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);

module.exports = router;
