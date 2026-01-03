const fs = require('fs');
const path = require('path');

// Safe folder name generator
const sanitizeFolderName = (name) => {
    return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
};

const initializeCourseFolders = (userName, courseName) => {
    try {
        const storageBase = process.env.STORAGE_PATH;
        if (!storageBase) {
            console.error('STORAGE_PATH not defined in environment variables');
            return;
        }

        const safeUserName = sanitizeFolderName(userName);
        const safeCourseName = sanitizeFolderName(courseName);

        // Path: /uploads/user_name/course_name
        const userDir = path.join(storageBase, safeUserName);
        const courseDir = path.join(userDir, safeCourseName);

        // Create User Dir
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }

        // Create Course Dir
        if (!fs.existsSync(courseDir)) {
            fs.mkdirSync(courseDir, { recursive: true });
        }

        // Create Step Folders (1 to 6)
        for (let i = 1; i <= 6; i++) {
            const stepDir = path.join(courseDir, `Step${i}`);
            if (!fs.existsSync(stepDir)) {
                fs.mkdirSync(stepDir);
            }
        }

        console.log(`Initialized folders for user: ${safeUserName}, course: ${safeCourseName}`);
        return true;
    } catch (error) {
        console.error('Failed to initialize course folders:', error);
        return false;
    }
};

module.exports = { initializeCourseFolders, sanitizeFolderName };
