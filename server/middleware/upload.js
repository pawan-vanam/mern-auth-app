const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { sanitizeFolderName } = require('../utils/fileSystem');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
        console.log("-> Multer Storage Destination:");
        console.log("   Body:", req.body);
        console.log("   User:", req.user ? req.user.name : "No User");

        const { courseName, step } = req.body;
        const userName = req.user.name;

        if (!courseName || !step) {
            console.error("!! Missing courseName or step in req.body. Ensure text fields are appended BEFORE file in FormData.");
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
    // Use original name but prepend timestamp to prevent overwrites
    // e.g., 1767455628409-MyScreenshot.png
    const uniqueSuffix = Date.now();
    const cleanName = sanitizeFolderName(file.originalname); // Reuse sanitize for safe filenames
    cb(null, `${uniqueSuffix}-${cleanName}`);
  }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

module.exports = upload;
