const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { sanitizeFolderName } = require('../utils/fileSystem');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
        const { courseName, step } = req.body;
        const userName = req.user.name;

        if (!courseName || !step) {
            return cb(new Error('Course name and Step are required'));
        }

        const safeUserName = sanitizeFolderName(userName);
        const safeCourseName = sanitizeFolderName(courseName);
        const storageBase = process.env.STORAGE_PATH;

        // Path: /uploads/user_name/course_name/StepX
        const uploadPath = path.join(storageBase, safeUserName, safeCourseName, `Step${step}`);

        // Ensure directory exists (safety check, though initialized on payment)
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    } catch (error) {
        cb(error);
    }
  },
  filename: function (req, file, cb) {
    // Preserve original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

module.exports = upload;
