const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const Assignment = require('../models/Assignment');

// @route   POST /api/upload
// @desc    Upload assignment file (code or screenshot)
// @access  Private
router.post('/', protect, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const { courseName, step, type } = req.body;

        if (!type || !['code', 'screenshot'].includes(type)) {
            return res.status(400).json({ success: false, message: 'Invalid upload type' });
        }

        // Save metadata to MongoDB
        const assignment = await Assignment.create({
            user: req.user.id,
            courseName,
            step,
            type,
            originalName: req.file.originalname,
            serverPath: req.file.path,
            mimeType: req.file.mimetype,
            size: req.file.size
        });

        res.status(201).json({
            success: true,
            message: 'File uploaded successfully',
            data: assignment
        });

        res.status(500).json({ success: false, message: 'Server Error during upload' });
    }
});

// @route   GET /api/upload/:courseName
// @desc    Get all uploaded files for a course
// @access  Private
router.get('/:courseName', protect, async (req, res) => {
    try {
        const { courseName } = req.params;
        const assignments = await Assignment.find({ 
            user: req.user.id, 
            courseName 
        }).sort({ step: 1, type: 1 }); // Sort by step (Module 1, 2...) then type

        res.status(200).json({
            success: true,
            count: assignments.length,
            data: assignments
        });
    } catch (error) {
        console.error('Fetch Files Error:', error);
        res.status(500).json({ success: false, message: 'Server Error fetching files' });
    }
});

module.exports = router;
