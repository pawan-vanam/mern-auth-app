const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  // Check for token in cookies (preferred for security) or headers

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`[AuthMiddleware] Decoded ID: ${decoded.id}`);

    // Get user from the token id
    req.user = await User.findById(decoded.id);

    if (!req.user) {
        console.log(`[AuthMiddleware] User Not Found for ID: ${decoded.id}`);
        
        // Debug: Log all users in DB to see if ID format matches
        const users = await User.find({}, '_id email');
        console.log(`[AuthMiddleware] Total users in DB: ${users.length}`);
        users.forEach(u => console.log(`[DB User] ID: ${u._id}, Email: ${u.email}`));
        
        return res.status(401).json({ success: false, message: 'User not found with this id' });
    }

    next();
  } catch (err) {
    console.error(`[AuthMiddleware] Error: ${err.message}`);
    console.error('Auth Middleware Error:', err.message);
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};
