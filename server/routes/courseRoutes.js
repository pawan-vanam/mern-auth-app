const express = require('express');
const {
  getCourses,
  getCourse,
  getCourseBySlug,
  createCourse,
  updateCourse,
  deleteCourse
} = require('../controllers/courseController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Middleware to check for Admin role
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user.role || !roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `User role ${req.user.role} is not authorized to access this route` 
            });
        }
        next();
    };
};

router.route('/')
  .get(getCourses)
  .post(protect, authorize('admin'), createCourse);

router.route('/:id')
  .get(getCourse)
  .put(protect, authorize('admin'), updateCourse)
  .delete(protect, authorize('admin'), deleteCourse);

router.route('/slug/:slug').get(getCourseBySlug);

module.exports = router;
