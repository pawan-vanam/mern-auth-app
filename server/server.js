const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');

const startKeepAlive = require('./utils/keepAlive');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    startKeepAlive(); // Start the heartbeat
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    // process.exit(1); // Keep server running to allow debugging/API usage without DB if needed
  });

const app = express();
app.set('trust proxy', 1); // <--- ADD THIS. This fixes the refresh issue.

// Global Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log(`Origin: ${req.headers.origin}, Host: ${req.headers.host}`);
  next();
});

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // Allow cross-origin for Option-B/Netlify
})); // Set security headers
app.use(cors({    
    origin: [
      'http://localhost:5173', 
      'http://localhost:5174',
      'https://zamanat.cloud',
      'https://www.zamanat.cloud',
      'https://pawan-temp.netlify.app',
      'https://api.zamanat.cloud',
      process.env.CLIENT_URL // Allow production client
    ].filter(Boolean), // Remove undefined/null if env var not set
    credentials: true, // Allow cookies to be sent
}));

// Body Parsing Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies (PhonePe Redirects)
app.use(cookieParser()); // Parse cookies

// Data Sanitization (Must be after body parsing)
// app.use(mongoSanitize()); // Prevent NoSQL injection
// app.use(xss()); // Prevent XSS attacks

// Basic Rate Limiting (Simple implementation)
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
