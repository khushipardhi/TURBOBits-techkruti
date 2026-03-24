# 🍽️ FoodLink — Surplus Food Redistribution Platform

> _"Connecting surplus food with hungry people — in real time."_

FoodLink is a real-time platform built to bridge the gap between surplus food and those who need it. It connects Donors (restaurants, hotels), Receivers (NGOs, food banks), and Delivery Volunteers into a seamless, 5-second polling loop. 

---

## 🚀 Key Features

- **Multi-Role Dashboards:** Distinct protected views for Donors, NGOs, Volunteers, and Admins.
- **Real-Time Feed:** See new food postings and claims within 5 seconds without refreshing.
- **Live Delivery Tracking:** Visual timeline trackers *(Listed → Claimed → Assigned → Picked Up → Delivered)*.
- **Multi-Item Donations:** Donors can list multiple food items (with quantities and units) in a single request.
- **Two-Way Modification Flow:** NGOs can modify quantities or remove items they don't need before confirming a claim, and Donors can review a visual diff of these changes.
- **Trust Score System:** Real-time trust calculations that reward successful deliveries and penalize no-shows.

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Framer Motion, TailwindCSS
- **Backend:** Node.js, Express.js
- **Database:** MySQL (Aiven Cloud)
- **Authentication:** JWT (JSON Web Tokens)
- **Routing:** React Router v6
- **Real-Time Sync:** Client-side 5s polling hooks

## 💻 Running Locally

### 1. Database Setup
Execute the SQL scripts found in `server/database_schema.md` to create tables. Wait for the Aiven instance to accept connections.

### 2. Backend Config
In the `server` folder, create a `.env` file:
```env
PORT=8000
DB_HOST=your-aiven-host
DB_USER=avnadmin
DB_PASSWORD=your-password
DB_NAME=foodlink
DB_PORT=25060
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```
Install dependencies and run:
`npm install && npm run dev`

### 3. Frontend Config
In the `client` folder, install dependencies and run:
`npm install && npm run dev`
App handles routing dynamically through Vite proxy setup.

## 🏆 Hackathon Details
Built by **Team TURBOBits-techkruti**. Turning waste into worth — one meal at a time.🍚
