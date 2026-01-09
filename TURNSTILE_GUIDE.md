# Cloudflare Turnstile Integration Guide

That "Success" widget you see is called **Cloudflare Turnstile**. It's a "smart CAPTCHA" that verifies users without making them click traffic lights or bicycles.

Here is how you can add it to your project **without me changing your code**.

## Step 1: Get Your Keys from Cloudflare

1.  Go to your **Cloudflare Dashboard**.
2.  On the left sidebar, click **Turnstile**.
3.  Click **"Add Site"**.
4.  **Site Name**: `Zamanat Auth`.
5.  **Domain**: `zamanat.cloud` (and `localhost` for testing).
6.  **Widget Mode**: `Managed` (Recommended - shows the "Success" box automatically).
7.  Click **Create**.
8.  **Copy these two keys**:
    - **Site Key**: (Public, goes in your React frontend)
    - **Secret Key**: (Private, goes in your Node.js backend `.env`)

---

## Step 2: Add to Frontend (React)

You need to add the Turnstile widget to your `Login.jsx` and `Signup.jsx`.

### 1. Install the library

Run this in your `client` terminal:

```bash
npm install react-turnstile
```

### 2. Update your Login/Signup Page

In your `client/src/pages/Signup.jsx` (or Login), add the widget inside your form.

```jsx
import { Turnstile } from "@marsidev/react-turnstile"; // Import this

// ... inside your component ...

const [turnstileToken, setTurnstileToken] = useState("");

// ... inside your JSX form, usually above the "Sign Up" button ...
<Turnstile
  siteKey="YOUR_SITE_KEY_HERE"
  onSuccess={(token) => setTurnstileToken(token)}
/>;

// When submitting the form, send this `turnstileToken` to your backend along with email/password
```

---

## Step 3: Add to Backend (Node.js)

Your server needs to verify that the token is real.

### 1. Update `.env`

Add your secret key to `server/.env`:

```env
TURNSTILE_SECRET_KEY=0x4AAAAAA... (your secret key)
```

### 2. Verify in Controller

In your `authController.js` (inside the `register` or `login` function), check the token **before** creating the user.

```javascript
// Add this helper function or put it directly in controller
const verifyTurnstile = async (token) => {
  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
      }),
    }
  );
  const data = await response.json();
  return data.success;
};

// ... inside exports.register ...
const { name, email, password, turnstileToken } = req.body; // Receive token

// Verify Turnstile
const isHuman = await verifyTurnstile(turnstileToken);
if (!isHuman) {
  return res
    .status(400)
    .json({ success: false, message: "Bot verification failed" });
}

// ... proceed with registration ...
```

## Summary

1.  **Cloudflare**: Generate Keys.
2.  **Frontend**: Show widget, get token.
3.  **Backend**: Receive token, verify with Cloudflare.

This will stop bots from creating fake accounts on your site! 🤖🚫
