const express = require('express');
const { register, login, googleLogin, verifyEmail, logout, getMe, forgotPassword, verifyResetCode, resetPassword, resendVerificationCode } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); // Protect middleware

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationCode);
router.get('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);

module.exports = router;
