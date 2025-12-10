# Step-by-Step Deployment Guide

This guide explains how to deploy your **MERN Stack** application (MongoDB, Express, React, Node.js) to the live internet so anyone can access it.

Since your app has two distinct parts (Frontend and Backend), we will deploy them separately.

---

## Prerequisites (Before You Start)

1.  **MongoDB Atlas:** You must use a Cloud Database, not a local one.
    - Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
    - Create a Cluster (Free Tier).
    - Get your connection string (e.g., `mongodb+srv://...`).
    - Replace your local `MONGODB_URI` in `.env` with this new cloud string to test.
2.  **GitHub Account:** Push your code to a GitHub repository. This makes deployment much easier as it automates updates.

---

## Part 1: Deploying the Backend (The Kitchen)

We need a service that runs Node.js 24/7. **Render** or **Railway** are great choices with free tiers. We will use **Render**.

1.  **Sign Up:** Go to [Render.com](https://render.com/) and sign in with GitHub.
2.  **New Web Service:** Click "New +" -> "Web Service".
3.  **Connect Repo:** Select your GitHub repository.
4.  **Configure Settings:**
    - **Root Directory:** `server` (Important! Your backend is in the `server` folder).
    - **Build Command:** `npm install`
    - **Start Command:** `node server.js`
5.  **Environment Variables:** Scroll down to "Environment Variables". Add the secrets from your `.env` file:
    - `MONGODB_URI`: (Your Cloud Database URL)
    - `JWT_SECRET`: (Your secret key)
    - `EMAIL_USER` / `EMAIL_PASS`: (Your email credentials)
    - `CLIENT_URL`: (Leave empty for now, we will add the Frontend URL later)
6.  **Deploy:** Click "Create Web Service".
7.  **Get URL:** Once finished, Render will give you a URL like `https://my-api.onrender.com`. **Copy this.**

---

## Part 2: Deploying the Frontend (The Waiter)

We need a service to host your static React files. **Vercel** is the best choice (creators of Next.js, great for React).

1.  **Prepare Code:**

    - Open `client/src/context/AuthContext.jsx`.
    - Change `axios.defaults.baseURL` to use an environment variable:
      ```javascript
      axios.defaults.baseURL =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      ```
    - Push this change to GitHub.

2.  **Sign Up:** Go to [Vercel.com](https://vercel.com/) and sign in with GitHub.
3.  **New Project:** Click "Add New..." -> "Project".
4.  **Import Repo:** Select your repository.
5.  **Configure Settings:**
    - **Framework Preset:** Vite (should detect automatically).
    - **Root Directory:** Click "Edit" and select `client`.
6.  **Environment Variables:**
    - Name: `VITE_API_URL`
    - Value: `https://my-api.onrender.com/api` (The URL you got from Render! Note the `/api` at the end).
7.  **Deploy:** Click "Deploy".
8.  **Get URL:** Vercel will give you a URL like `https://my-app.vercel.app`.

---

## Part 3: Connecting the Two (CORS & Cookies)

Now the Frontend knows where the Backend is. But the Backend needs to know who the Frontend is to allow requests (Security).

1.  **Go back to Render Dashboard.**
2.  **Environment Variables:** Edit the variables.
    - Add/Update `CLIENT_URL` = `https://my-app.vercel.app` (Your new Vercel URL, no trailing slash).
3.  **Update `server.js` (If not already dynamic):**
    - Ensure your CORS configuration uses this variable:
      ```javascript
      app.use(
        cors({
          origin: [process.env.CLIENT_URL, "http://localhost:5173"],
          credentials: true,
        })
      );
      ```
    - Push any code changes to GitHub (Render will auto-redeploy).

---

## Part 4: Connecting a Custom Domain (The "Pro" Step)

You want `www.your-brand.com` instead of `.vercel.app`.

1.  **Buy a Domain:** Purchase one from GoDaddy, Namecheap, Google Domains, etc.
2.  **Go to Vercel (Frontend):**
    - Settings -> Domains.
    - Enter `www.your-brand.com`.
    - Vercel will give you "DNS Records" (usually an **A Record** or **CNAME**).
3.  **Go to your Domain Registrar (e.g., GoDaddy):**
    - Find "DNS Management".
    - Add the records Vercel gave you.
    - Wait 5-60 minutes.
4.  **Done!** Your users now visit `www.your-brand.com`.

### What about the Backend Domain?

You usually **do not** need a custom domain for the backend (e.g., `api.your-brand.com`) unless you have public customers using your API. It's perfectly fine for your frontend (`www.your-brand.com`) to talk to `my-api.onrender.com` behind the scenes.

If you _really_ want `api.your-brand.com`:

1.  Go to Render -> Settings -> Custom Domains.
2.  Add `api.your-brand.com`.
3.  Add the DNS records Render gives you to your Domain Registrar.
4.  Update `VITE_API_URL` in Vercel to allow this new API domain.
