const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/pay', protect, paymentController.initiatePayment);
router.post('/status', protect, paymentController.checkStatus);
router.get('/user-status', protect, paymentController.getUserPaymentStatus);
router.all('/redirect', paymentController.handleRedirect);

module.exports = router;
