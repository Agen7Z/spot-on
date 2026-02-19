# Spot On — Period Tracker (MERN)

Spot On is a MERN-based period tracker that predicts menstrual cycles, shows the current cycle phase, and lets users log symptoms and moods in a clean, modern dashboard.

## Structure

- `server` – Node/Express API with MongoDB (users, cycles, logs, reminders)
- `client` – React single-page app (landing page, auth, dashboard)

## Getting started

1. **Install dependencies**

   ```bash
   cd spot-on
   npm install
   cd server
   npm install
   cd ../client
   npm install
   ```

2. **Environment variables**

   Create `server/.env`:

   ```env
   MONGODB_URI=mongodb://localhost:27017/spot_on
   JWT_SECRET=change-me-in-production
   PORT=5000
   ```

3. **Run the backend**

   ```bash
   cd server
   npm run dev
   ```

4. **Run the frontend**

   In a separate terminal:

   ```bash
   cd client
   npm run dev
   ```

   The app will be available at `http://localhost:5173` and will proxy API calls to `http://localhost:5000`.

## Core features implemented

- Email/password signup & login with JWT
- Cycle storage and simple prediction engine (average cycle length, next period, phase)
- Daily symptom & mood logs
- Basic reminder configuration API
- Responsive, mobile-friendly UI with:
  - Marketing landing page
  - Auth screen (signup/login)
  - Dashboard with next-period countdown, current phase, cycle entry, and recent logs

This is a solid starting point for further enhancements like notifications, advanced analytics, and deployment.
