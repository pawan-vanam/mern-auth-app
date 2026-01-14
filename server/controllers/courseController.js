const Course = require('../models/Course');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: courses.length, data: courses });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
exports.getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.status(200).json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single course by slug
// @route   GET /api/courses/slug/:slug
// @access  Public
exports.getCourseBySlug = async (req, res, next) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug });

    if (!course) {
        // Fallback or just return 404. For now 404.
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.status(200).json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
};

// Helper: Auto-assign Icon based on title/keywords
const assignIcon = (title) => {
    const t = title.toLowerCase();
    if (t.includes('web') || t.includes('full stack') || t.includes('html') || t.includes('react')) return 'globe';
    if (t.includes('data') || t.includes('science') || t.includes('python')) return 'code';
    if (t.includes('cyber') || t.includes('security') || t.includes('hacking')) return 'lock';
    if (t.includes('network') || t.includes('cloud')) return 'server';
    if (t.includes('app') || t.includes('mobile') || t.includes('android') || t.includes('ios')) return 'mobile';
    if (t.includes('ai') || t.includes('artificial') || t.includes('machine')) return 'sparkles';
    return 'book'; // Default
};

// Helper: Auto-assign Theme based on category/keywords
const assignTheme = (title, category) => {
    const t = title.toLowerCase();
    const c = category.toLowerCase();
    
    if (c.includes('it') || t.includes('web')) return 'green';
    if (c.includes('data') || t.includes('data')) return 'blue';
    if (c.includes('cs') || t.includes('cyber')) return 'orange';
    if (c.includes('management')) return 'purple';
    return 'indigo';
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Admin)
exports.createCourse = async (req, res, next) => {
  try {
    // Auto-enrich data if not provided
    let { title, category } = req.body;
    
    if (!req.body.icon) {
        req.body.icon = assignIcon(title);
    }
    
    if (!req.body.theme) {
        req.body.theme = assignTheme(title, category);
    }

    // Default modules if empty (Mock for now to strictly follow "Admin enters X" but "System generates display")
    if (!req.body.modules || req.body.modules.length === 0) {
        req.body.modules = [
            { id: 1, title: 'Introduction', description: 'Course overview and setup' },
            { id: 2, title: 'Core Concepts', description: 'Fundamental principles' },
            { id: 3, title: 'Advanced Topics', description: 'Deep dive into complex areas' },
            { id: 4, title: 'Project', description: 'Hands-on practical assignment' }
        ];
    }
    
    // Default Tags
    if (!req.body.tags) {
        const typeTag = category.includes('IT') || category.includes('CS') ? 'UG' : 'PG'; 
        req.body.tags = [
            { label: 'Certification', type: 'primary' },
            { label: typeTag, type: 'secondary' }
        ];
    }

    const course = await Course.create(req.body);
    res.status(201).json({ success: true, data: course });
  } catch (err) {
    if (err.code === 11000) {
        return res.status(400).json({ success: false, message: 'Course with this title already exists' });
    }
    next(err);
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Admin)
exports.updateCourse = async (req, res, next) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Re-eval icon/theme if title changes? Maybe not, keep manual override if they strictly edited it.
    // Allow overwrite.

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Admin)
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
