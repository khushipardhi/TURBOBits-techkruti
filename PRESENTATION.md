# 🍽️ FoodLink — Surplus Food Redistribution Platform

> _"Connecting surplus food with hungry people — in real time."_

---

## 1. 🚨 Problem Statement

Every day in India:
- **40% of food produced** goes to waste
- **Hotels, restaurants, and canteens** discard tons of edible surplus
- **NGOs and food banks** struggle to find food for millions of beneficiaries
- There is **no real-time system** connecting donors with receivers

The gap between surplus food and hungry people isn't a supply problem — **it's a logistics problem.**

---

## 2. 💡 Solution Overview

**FoodLink** is a real-time surplus food redistribution platform that connects:

| Role | Who | What they do |
|------|-----|--------------|
| 🏨 **Donor** | Restaurants, Hotels, Caterers | Post surplus food listings |
| 🏢 **NGO / Receiver** | Food banks, shelters | Browse and claim available food |
| 🚗 **Volunteer** | Delivery partners | Accept and deliver claimed food |
| ⚙️ **Admin** | Platform operator | Monitor activity and trust scores |

All four roles operate on **live dashboards** that update every 5 seconds — no refresh needed.

---

## 3. ✨ Key Features

### ✅ Real-Time Food Feed
NGOs see available food listings the moment donors post them. Data refreshes automatically every 5 seconds.

### ✅ End-to-End Delivery Tracking
A visual timeline tracker shows the full journey:
**Listed → Claimed → Assigned → Picked Up → Delivered**

### ✅ Trust Score System
Every user has a trust score (0–10) that updates automatically based on behavior — completed donations, pickups, and deliveries are rewarded.

### ✅ Role-Based Dashboards
Each role gets a customized dashboard with only the actions relevant to them. Fully protected with JWT authentication.

### ✅ Notification Bell
A live notification badge in the navbar shows pending requests, available food, or open tasks — role-specific, updated every 8 seconds.

---

## 4. 🔄 How It Works

```
DONOR posts food
    → Chooses: Food Type, Description, Quantity (kg / servings / plates), Hygiene Confirmation
    → Food listing appears in NGO feed within 5 seconds

NGO sees available food
    → Claims a listing with one click
    → Donor receives instant notification

DONOR accepts or rejects the request
    → On accept: Listing becomes available for volunteers to deliver

VOLUNTEER picks up the task
    → Confirms pickup → En route → Confirms delivery
    → Trust scores update automatically for all parties

ADMIN monitors everything
    → Live stats: meals saved, active donors, volunteers, trust logs
```

---

## 5. 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (React)                  │
│  Vite + Framer Motion + TailwindCSS                 │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │
│  │  Donor  │ │   NGO    │ │Volunteer │ │ Admin  │  │
│  │Dashboard│ │Dashboard │ │Dashboard │ │ Panel  │  │
│  └─────────┘ └──────────┘ └──────────┘ └────────┘  │
│         ↕ polls every 5s via fetch + JWT            │
└───────────────────────┬─────────────────────────────┘
                        │ REST API
┌───────────────────────▼─────────────────────────────┐
│                BACKEND (Node.js + Express)           │
│  Auth · Food · Requests · Volunteer · Admin Routes  │
│  JWT Auth · Role-Based Access · Trust Score Engine  │
│  Rate Limiting · Helmet · CORS · Morgan             │
└───────────────────────┬─────────────────────────────┘
                        │ MySQL2 Pool (SSL)
┌───────────────────────▼─────────────────────────────┐
│              DATABASE (MySQL on Aiven Cloud)         │
│  users · food_listings · food_requests              │
│  deliveries · trust_logs · donors · receivers       │
└─────────────────────────────────────────────────────┘
```

---

## 6. 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Framer Motion |
| **Styling** | Custom CSS Design System (glassmorphism, dark mode) |
| **Backend** | Node.js, Express.js |
| **Database** | MySQL 8.x (hosted on Aiven Cloud) |
| **Auth** | JWT (JSON Web Tokens), bcryptjs |
| **Security** | Helmet, CORS, Rate Limiting, SSL |
| **Real-Time** | Client-side polling (5s interval) |
| **Deployment ready** | Vite build, dotenv, modular architecture |

---

## 7. 🎬 Demo Flow

> _We will walk through the complete lifecycle of a food donation._

**Step 1 — Register**
- Register a Donor (Mumbai Restaurant), an NGO (Akshaya Patra), and a Volunteer

**Step 2 — Donor Posts Food**
- Login as Donor → Post: "Chicken Biryani, 50 servings, Non-Veg, Hygiene Confirmed"
- Show the listing appear immediately on the NGO dashboard (no refresh)

**Step 3 — NGO Claims Food**
- Login as NGO → See the live food feed → Claim the biryani
- Switch back to Donor dashboard — show the pending request appear instantly

**Step 4 — Donor Accepts**
- Donor clicks Accept → Request status updates to APPROVED
- Volunteer dashboard now shows the task in "Available Tasks"

**Step 5 — Volunteer Delivers**
- Login as Volunteer → Accept Task → Confirm Pickup → Confirm Delivery
- Show the delivery timeline update across all 3 dashboards in real time

**Step 6 — Admin View**
- Show Admin panel: meals saved, trust score logs, user management

---

## 8. 🔮 Future Scope

### 📍 GPS-Based Matching
Auto-assign the nearest available volunteer when a request is accepted, using geolocation coordinates stored in the database.

### 📱 Mobile App (React Native)
A dedicated volunteer app with push notifications, live map view, and one-tap confirm pickup/delivery.

### 🤖 AI Surplus Prediction
Integrate ML models that predict surplus quantity based on day, season, and event type — helping donors pre-schedule listings.

---

## 9. 🏆 Impact

| Metric | Value |
|--------|-------|
| Roles supported | 4 (Donor, NGO, Volunteer, Admin) |
| API endpoints | 19+ |
| Real-time update interval | 5 seconds |
| Food expiry window | 2 hours (auto-enforced) |
| Trust score actions tracked | 6 types |
| Database tables | 8 |

---

> **Built at the Hackathon by Team TURBOBits-techkruti**
> _Turning waste into worth — one meal at a time._ 🍚
