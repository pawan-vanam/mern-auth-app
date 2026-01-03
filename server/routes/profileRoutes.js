const express = require('express');
const router = express.Router();
const { getProfile, createOrUpdateProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getProfile);
router.post('/', protect, createOrUpdateProfile);

module.exports = router;
