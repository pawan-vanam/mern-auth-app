# Case Study: Zamanat Auth App Development

**Date:** December 08, 2025  
**Version:** 1.0  
**Status:** Production Ready

---

## 1. Executive Summary

The **Zamanat Auth App** is a secure, modern, and scalable authentication system built using the **MERN** stack (MongoDB, Express, React, Node.js). It was designed to provide a robust foundation for Zamanat Tech Solutions' future applications, featuring enterprise-grade security controls like HTTP-Only cookies, JWT authentication, and automated email verification.

This document details the complete development lifecycle, technical architecture, and codebase structure.

---

## 2. Technology Stack

We chose the MERN stack for its unified JavaScript ecosystem and performance.

| Technology     | Purpose                                 | Usage |
| :------------- | :-------------------------------------- | :---- |
| **MongoDB**    | Cloud Database (Atlas) for storing data | 15%   |
| **Express.js** | Backend Framework for API logic         | 20%   |
| **React**      | Frontend UI Library (with Vite)         | 40%   |
| **Node.js**    | Server Runtime Environment              | 25%   |

**Key Frameworks & Libraries:**

- **Tailwind CSS:** For rapid, responsive, and clean UI styling.
- **Bcrypt.js:** Industry-standard library for hashing passwords.
- **Nodemailer:** Handles sending SMTP emails (Gmail integration).
- **Lucide React:** Provides modern, lightweight SVG icons.
- **JsonWebToken:** Manages secure, stateless session tokens.

---

## 3. Architecture & File Structure

The project is split into two distinct parts: the **Client** (Frontend) and the **Server** (Backend).

### Project Tree

```
ZAMANAT AUTH APP
├── client/                     # [FRONTEND] React Application
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Reusable UI Blocks
│   │   │   ├── Button.jsx      # Generic Button component
│   │   │   ├── Input.jsx       # Text fields with Icon support
│   │   │   └── Loader.jsx      # Loading spinners
│   │   ├── context/            # Global State Management
│   │   │   └── AuthContext.jsx # Handles Login/User Data
│   │   ├── pages/              # Main Route Views
│   │   │   ├── Login.jsx       # Login Page
│   │   │   ├── Signup.jsx      # Registration Page
│   │   │   ├── VerifyEmail.jsx # OTP Verification Page
│   │   │   ├── Dashboard.jsx   # Protected User Area
│   │   │   └── Forgot*.jsx     # Password Recovery Pages
│   │   ├── App.jsx             # Main Router & Protection Logic
│   │   └── main.jsx            # Entry Point
│   └── vite.config.js          # Build Configuration
│
└── server/                     # [BACKEND] API Server
    ├── controllers/            # Business Logic Functions
    │   └── authController.js   # Handles Register, Login, Email
    ├── middleware/             # Request Interceptors
    │   └── authMiddleware.js   # Verifies JWT Tokens
    ├── models/                 # Database Schemas
    │   └── User.js             # User Data Structure
    ├── routes/                 # API Endpoint Definitions
    │   └── authRoutes.js       # /api/auth/* routes
    ├── server.js               # Application Entry Point
    └── .env                    # Security Keys & Config
```

---

## 4. Codebase Deep Dive

### A. The Backend (Node.js & Express)

The backend acts as the brain, processing requests and protecting the database.

**1. `server.js` (The Gateway)**
This is the first file to run. It:

- Connects to **MongoDB Atlas**.
- Sets up security middleware (`helmet`, `cors`, `rate-limit`).
- Parses incoming data (JSON and Cookies).
- Registers the `/api/auth` routes.

**2. `controllers/authController.js` (The Logic)**
Contains the specific logic for every feature:

- **`register`**: Checks for existing users. If the user is unverified, it updates their data and resends the OTP using an HTML email template.
- **`login`**: Validates the password using `bcrypt.compare`. If valid, it sends a standardized JWT token in a secure, HTTP-Only cookie.
- **`verifyEmail`**: Compares the 6-digit code against the one stored in the database.

**3. `models/User.js` (The Data Structure)**
Defines what a "User" looks like.

- **_Crucial Logic:_** It uses a `pre('save')` hook. Before saving any user, it automatically checks if the password changed. If so, it hashes it. This ensures we **never** store plain text passwords.

### B. The Frontend (React)

The frontend is the face of the application.

**1. `context/AuthContext.jsx` (Global State)**
Instead of passing data manually between every page, this "Context" holds the user state globally.

- **`checkAuth`**: Runs automatically when the app starts to check if the user is logged in.
- **`login/register`**: Wrappers around `axios` calls that handle success/failure and update the global user object.

**2. `App.jsx` (Routing & Protection)**
Controls navigation.

- **`ProtectedRoute`**: A wrapper component. It checks the `AuthContext`. If `isAuthenticated` is false, it forces a redirect to `/login`. This protects the Dashboard.

---

## 5. Key Features Implemented

### 1. Secure Registration Flow

1.  User enters Name, Email, Password.
2.  Server matches email. If new, creates record.
3.  Server generates 6-digit OTP.
4.  **Gmail SMTP** sends an HTML-styled email (Zamanat Branding).
5.  User enters OTP -> Account Verified.

### 2. Password Recovery

1.  User clicks "Forgot Password".
2.  Route `/forgot-password` requests a token.
3.  Server sends a strictly timed OTP (10 min expiry).
4.  User verifies OTP and sets a new password.

### 3. Security Hardening

- **Data Protection:** Passwords are hashed with Bcrypt (Salt rounds: 10).
- **Session Security:** JWT Tokens are HTTP-Only (invisible to JavaScript hackers).
- **Attack Prevention:** Rate limiting prevents brute-force login attempts.

---

## 6. How to Maintain & Update

**To Change Database:**
Edit `server/.env` -> Update `MONGODB_URI`.

**To Update Email Branding:**
Edit `server/controllers/authController.js` -> Function `register` or `forgotPassword` -> Modify the `const html = ...` template string.

**To Run Locally:**

1.  Terminal 1: `cd server` -> `npm run dev`
2.  Terminal 2: `cd client` -> `npm run dev`

---

_Generated for Zamanat Tech Solutions_
