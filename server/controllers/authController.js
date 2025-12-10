const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');

// --- EMAIL MOCKING / SENDING LOGIC ---
// In a real app, use SendGrid, AWS SES, or a real SMTP provider.
// For this task, we will try to use Ethereal for testing or fall back to console logging.
const sendEmail = async (options) => {
    // Create a transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',  // <--- Use this! It handles Host/Port automatically
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const message = {
    from: `${process.env.FROM_NAME || 'ZAMANAT'} <${process.env.FROM_EMAIL || 'noreply@zamanat.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html, // Optional
  };

  try {
    const info = await transporter.sendMail(message);
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.log('Email send failed:', error);
    console.log('Email send failed (likely due to missing/invalid credentials), logging to console instead:');
    console.log('----------------------------------------------------');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.message}`);
    console.log('----------------------------------------------------');
  }
};

// --- CONTROLLERS ---

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    // Check if user exists
    let user = await User.findOne({ email });

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (user) {
        if (user.isVerified) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        } else {
            // User exists but is not verified. Update details and Send new code.
            user.name = name;
            user.password = password; // Will be hashed by pre-save
            user.verificationCode = verificationCode;
            user.verificationCodeExpires = Date.now() + 10 * 60 * 1000;
            await user.save();
        }
    } else {
        // Create new user
        user = await User.create({
            name,
            email,
            password,
            verificationCode,
            verificationCodeExpires: Date.now() + 10 * 60 * 1000
        });
    }

    // Send verification email
    const verificationEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verify your account</title>
        <style>
          body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7fee7; }
          .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
          .header { background-color: #ffffff; padding: 30px; text-align: center; border-bottom: 3px solid #bef264; }
          .logo-text { font-size: 24px; font-weight: bold; color: #3f6212; letter-spacing: -0.5px; }
          .content { padding: 40px 30px; text-align: center; color: #374151; }
          .welcome-text { font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #1a2e05; }
          .otp-box { background-color: #ecfccb; border: 2px dashed #84cc16; color: #365314; font-size: 32px; font-weight: bold; letter-spacing: 5px; padding: 20px; margin: 30px 0; border-radius: 12px; display: inline-block; }
          .footer { background-color: #f7fee7; padding: 20px; text-align: center; font-size: 12px; color: #65a30d; }
          .note { font-size: 14px; line-height: 1.6; color: #4b5563; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo-text">ZAMANAT Tech Solutions Pvt. Ltd.</div>
          </div>
          <div class="content">
            <div class="welcome-text">Welcome to Zamanat Tech!</div>
            <p class="note">Thank you for joining us. To complete your registration and secure your account, please use the following verification code:</p>
            
            <div class="otp-box">${verificationCode}</div>
            
            <p class="note">This code will expire in 10 minutes.</p>
            <p class="note" style="margin-top: 30px; font-size: 13px; color: #9ca3af;">If you didn't create an account with us, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Zamanat Tech Solutions Pvt. Ltd. All rights reserved.<br>
            Empowering Innovation, Ensuring Success
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Verify your account - Zamanat Tech Solutions',
      html: verificationEmailHtml,
      message: `Your verification code is: ${verificationCode}`, // Fallback text
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for the verification code.',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Verify email with OTP
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({
      email,
      verificationCode: code,
      verificationCodeExpires: { $gt: Date.now() }
    }).select('+verificationCode +verificationCodeExpires');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    console.log("-> Login Request Received");
    const { email, password } = req.body;
    console.log("-> Email:", email);

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log("-> User not found");
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if verified
    if (!user.isVerified) {
      console.log("-> User not verified");
      return res.status(401).json({ success: false, message: 'Please verify your email first' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log("-> Password mismatch");
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    console.log("-> Login Successful, sending token");
    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error("!!! LOGIN ERROR CAUGHT !!!");
    console.error(err);
    console.error("Stack:", err.stack);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Google Login
// @route   POST /api/auth/google
// @access  Public
exports.googleLogin = async (req, res, next) => {
  try {
    console.log("-> Google Login Request Received");
    const { token } = req.body;
    console.log("-> Token length:", token ? token.length : "null");
    
    if (!token) {
        throw new Error("No token provided");
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    console.log("-> Verifying ID Token...");
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { name, email, sub: googleId, picture } = ticket.getPayload();
    console.log("-> Token Verified. User:", email);

    let user = await User.findOne({ email });

    if (user) {
        console.log("-> User found.");
        // User exists, link googleId if not present
        if (!user.googleId) {
            user.googleId = googleId;
            await user.save();
        }
        // Force verify if logging in with Google (trusted provider)
        if (!user.isVerified) {
            user.isVerified = true;
            await user.save();
        }
    } else {
        console.log("-> Creating new user.");
        // Create new user
        // Generate a random secure password since they logged in via Google
        const generatedPassword = crypto.randomBytes(20).toString('hex');
        
        user = await User.create({
            name,
            email,
            password: generatedPassword,
            googleId,
            isVerified: true
        });
    }

    console.log("-> Google Login Successful");
    sendTokenResponse(user, user.isNew ? 201 : 200, res);
  } catch (err) {
    console.error("!!! GOOGLE AUTH ERROR !!!");
    console.error("Error:", err.message);
    console.error("Stack:", err.stack);
    res.status(401).json({ success: false, message: 'Google authentication failed' });
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: true, // Required for HTTPS
    sameSite: 'None', // Required for Cross-Site (Netlify->Render)
  });

  res.status(200).json({ success: true, message: 'User logged out' });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user
  });
};

// @desc    Forgot Password - Send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found with this email' });
    }

    // Generate 6-digit OTP
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordCode = resetToken;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Send Reset Email
    const resetEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Password</title>
        <style>
          body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7fee7; }
          .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
          .header { background-color: #ffffff; padding: 30px; text-align: center; border-bottom: 3px solid #bef264; }
          .logo-text { font-size: 24px; font-weight: bold; color: #3f6212; letter-spacing: -0.5px; }
          .content { padding: 40px 30px; text-align: center; color: #374151; }
          .welcome-text { font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #1a2e05; }
          .otp-box { background-color: #ecfccb; border: 2px dashed #84cc16; color: #365314; font-size: 32px; font-weight: bold; letter-spacing: 5px; padding: 20px; margin: 30px 0; border-radius: 12px; display: inline-block; }
          .footer { background-color: #f7fee7; padding: 20px; text-align: center; font-size: 12px; color: #65a30d; }
          .note { font-size: 14px; line-height: 1.6; color: #4b5563; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo-text">ZAMANAT Tech Solutions Pvt. Ltd.</div>
          </div>
          <div class="content">
            <div class="welcome-text">Password Reset Request</div>
            <p class="note">We received a request to reset your password. Use the following code to proceed:</p>
            
            <div class="otp-box">${resetToken}</div>
            
            <p class="note">This code will expire in 10 minutes.</p>
            <p class="note" style="margin-top: 30px; font-size: 13px; color: #9ca3af;">If you didn't request a password reset, please ignore this email.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Zamanat Tech Solutions Pvt. Ltd. All rights reserved.<br>
            Empowering Innovation, Ensuring Success
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Reset Password Code - Zamanat Tech Solutions',
      html: resetEmailHtml,
      message: `Your reset code is: ${resetToken}`,
    });

    res.status(200).json({ success: true, message: 'Reset code sent to email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Verify Reset Password Code
// @route   POST /api/auth/verify-reset-code
// @access  Public
exports.verifyResetCode = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({
      email,
      resetPasswordCode: code,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset code' });
    }

    res.status(200).json({ success: true, message: 'Code verified successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, code, password } = req.body;

    const user = await User.findOne({
      email,
      resetPasswordCode: code,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password = password; // Will be hashed
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful. You can now login.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Resend Verification Code
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerificationCode = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'This account is already verified' });
    }

    // Generate new code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send verification email
    const verificationEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verify your account</title>
        <style>
          body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7fee7; }
          .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
          .header { background-color: #ffffff; padding: 30px; text-align: center; border-bottom: 3px solid #bef264; }
          .logo-text { font-size: 24px; font-weight: bold; color: #3f6212; letter-spacing: -0.5px; }
          .content { padding: 40px 30px; text-align: center; color: #374151; }
          .welcome-text { font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #1a2e05; }
          .otp-box { background-color: #ecfccb; border: 2px dashed #84cc16; color: #365314; font-size: 32px; font-weight: bold; letter-spacing: 5px; padding: 20px; margin: 30px 0; border-radius: 12px; display: inline-block; }
          .footer { background-color: #f7fee7; padding: 20px; text-align: center; font-size: 12px; color: #65a30d; }
          .note { font-size: 14px; line-height: 1.6; color: #4b5563; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo-text">ZAMANAT Tech Solutions Pvt. Ltd.</div>
          </div>
          <div class="content">
            <div class="welcome-text">New Verification Code</div>
            <p class="note">You requested a new verification code. Please use the following code to secure your account:</p>
            
            <div class="otp-box">${verificationCode}</div>
            
            <p class="note">This code will expire in 10 minutes.</p>
            <p class="note" style="margin-top: 30px; font-size: 13px; color: #9ca3af;">If you didn't request this, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Zamanat Tech Solutions Pvt. Ltd. All rights reserved.<br>
            Empowering Innovation, Ensuring Success
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      email: user.email,
      subject: 'New Verification Code - Zamanat Tech Solutions',
      html: verificationEmailHtml,
      message: `Your new verification code is: ${verificationCode}`,
    });

    res.status(200).json({ success: true, message: 'Verification code resent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Helper to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
    ),
    httpOnly: true,
    secure: true,      // <--- CHANGE THIS (Force true)
    sameSite: 'None',  // <--- CHANGE THIS (Force 'None')
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token, // Also send token in body for flexibility
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      }
    });
};
