const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { assessCourse, getAssessment } = require('../controllers/assessmentController');

// @route   POST /api/assessment
// @desc    Trigger AI assessment for a course
// @access  Private
router.post('/', protect, assessCourse);

// @route   GET /api/assessment/:courseName
// @desc    Get latest assessment results
// @access  Private
router.get('/:courseName', protect, getAssessment);

module.exports = router;
