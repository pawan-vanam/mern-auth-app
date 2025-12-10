# Beginner's Guide to the ZAMANAT Auth Application

This guide explains the Full Stack Authentication Application in simple terms. It covers what the application does, how the code works, and how the different parts speak to each other.

---

## 1. High-Level Overview

Imagine this application as a restaurant.

- **The Frontend (Client)** is the **Server/Waiter**. It shows the menu to the customer (User), takes their order (Inputs), and brings them the food (Data).
- **The Backend (Server)** is the **Kitchen**. It receives the order, cooks the food (Processes Logic), and hands it to the waiter.
- **The Database (MongoDB)** is the **Pantry/Fridge**. It stores all the ingredients (User Data) until they are needed.

### Technologies Used

- **Node.js & Express (Backend):** The software running the Kitchen.
- **React (Frontend):** The technology used to build the beautiful menus and interface.
- **MongoDB (Database):** The storage system for user information.

---

## 2. The Backend (The Kitchen)

The backend code lives in the `server/` folder. It has no visual interface; it just waits for requests (orders) and sends back responses.

### Key Files & Their Jobs

#### `server/server.js` (The Manager)

- **What it is:** The main entry point. When you start the backend, this file runs first.
- **What it does:**
  - It starts the application (opens the restaurant).
  - It connects to the Database (unlocks the pantry).
  - It sets up security rules (hires security guards like `helmet` and `cors`).
  - It tells the app where to find the "routes" (menu items).
- **Key Code:** `app.listen(PORT, ...)` is the command that actually opens the restaurant for business.

#### `server/models/User.js` (The Recipe Card)

- **What it is:** A "Schema" or blueprint.
- **What it does:** It defines exactly what a "User" looks like in our database.
- **Details:**
  - It says a user MUST have a `name`, `email`, and `password`.
  - It has special logic to **encrypt** the password before saving (so even the database admin can't read it).
  - It has a method `matchPassword` to check if a login password is correct.

#### `server/routes/authRoutes.js` (The Menu)

- **What it is:** A list of all things the outside world can ask for.
- **What it does:** It maps specific URLs (like `/api/auth/login`) to specific functions (Controllers).
- **Example:**
  - "If someone goes to `/register`, send them to the `register` controller."
  - "If someone goes to `/login`, send them to the `login` controller."

#### `server/controllers/authController.js` (The Chef)

- **What it is:** The logic handler.
- **What it does:** This contains the actual code for each feature.
- **Key Functions:**
  - `register`: Checks if email exists -> Hashes password -> Saves new user -> Sends verification email.
  - `login`: Finds user by email -> Checks if password matches -> Checks if verified -> Creates a "Token" (Session Cookie).
  - `verifyEmail`: A security step to prove the user owns the email address.

#### `server/middleware/authMiddleware.js` (The Bouncer)

- **What it is:** A security checkpoint.
- **What it does:** It runs _before_ protected actions (like "Get My Profile").
- **How it works:** It checks if the request has a valid "Token" cookie. If yes, it lets the request pass to the Controller. If no, it kicks the user out with "Not Authorized".

---

## 3. The Frontend (The Waiter/Menu)

The frontend lives in the `client/` folder. This is what you see in the browser.

### Key Files & Their Jobs

#### `client/src/main.jsx` (The Entrance)

- **What it is:** The very first file to run in the browser.
- **What it does:** It grabs the HTML element `<div id="root"></div>` and injects our entire React app into it.

#### `client/src/App.jsx` (The Traffic Controller)

- **What it is:** The Router.
- **What it does:** It decides which "Page" to show based on the URL bar.
- **Logic:**
  - "If URL is `/login`, show the `<Login />` page."
  - "If URL is `/dashboard`, show `<Dashboard />`, BUT only if the user is logged in (`ProtectedRoute`)."

#### `client/src/context/AuthContext.jsx` (The Waiter's Memory)

- **What it is:** Global State Management.
- **What it does:** It holds the information "Is the user logged in?" and "Who is the user?" so that _every_ page can access it without asking the server again and again.
- **Super Power:** It contains the specific **API Calls**. This file uses `axios` to actually send the messages to the backend.
  - `login()` function here sends a POST request to `http://localhost:5000/api/auth/login`.

#### `client/src/pages/` (The Tables/Views)

- **Files:** `Login.jsx`, `Signup.jsx`, `Dashboard.jsx`, etc.
- **What they are:** These are the visual components with forms, buttons, and text.
- **How they work:** When you click "Submit" on `Login.jsx`, it calls the `login()` function from `AuthContext.jsx`.

---

## 4. How Frontend & Backend Connect

This is the most important part for a Full Stack Developer.

1.  **The Bridge:** The connection happens via **HTTP Requests**.
2.  **The Tool:** The frontend uses a library called `axios` (configured in `AuthContext.jsx`).
3.  **The Process:**
    - **Frontend:** `axios.post('/api/auth/login', { email, password })`
    - **Internet/Network:** The request travels to port 5000.
    - **Backend:** `server.js` hears the request -> passes to `authRoutes` -> passes to `authController.login`.
    - **Backend:** detailed logic runs -> sends back JSON `{ success: true, user: ... }`.
    - **Frontend:** `AuthContext` receives the JSON -> updates the state -> `App.jsx` sees the state change and redirects user to Dashboard.

**Visual Flow:**
User Clicks Button -> React Function -> Axios -> HTTP Request -> Server Route -> Controller -> Database -> Controller -> HTTP Response -> React Function -> Screen Update.

---

## 5. How to Connect a NEW Frontend

What if you want to build a Mobile App? Or a completely new Website Design?

**Great news:** You generally **DO NOT** need to touch the Backend.

The Backend is an **API (Application Programming Interface)**. It speaks JSON, which is a universal language.

### Steps to connect a NEW UI (e.g., A Vue.js app or a Mobile App):

1.  **Build the UI:** Create your inputs and buttons in the new framework.
2.  **Point to the Server:** In your new app's settings, set the API URL to `http://localhost:5000` (or your live server URL).
3.  **Send the Same Requests:**
    - To login, send a POST request with JSON `{ "email": "...", "password": "..." }` to `/api/auth/login`.
    - To register, send a POST request to `/api/auth/register`.
4.  **Handle the Cookies:** Ensure your new app is configured to accept and store "Cookies" (specifically `credentials: true`), because that's how this backend remembers users.

**Analogy:** The Kitchen (Backend) doesn't care if the Waiter (Frontend) is wearing a tuxedo (React) or a t-shirt (Mobile App). As long as the orderTicket (JSON Request) is written correctly, the Kitchen will cook the food.
