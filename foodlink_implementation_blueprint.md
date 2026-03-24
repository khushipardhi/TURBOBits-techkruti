# FoodLink — Complete Implementation Blueprint

> A production-ready specification for rebuilding the surplus food redistribution system from scratch using **React.js + Node.js (Express) + MySQL (Aiven)**.

---

## 1. Project Overview

### Problem Summary
Approximately one-third of all food produced globally is wasted, while millions go hungry daily. Restaurants, hotels, event venues, and canteens frequently discard surplus food that is still fresh and safe to consume. There is no efficient, real-time system to bridge surplus food donors with NGOs/food banks that serve vulnerable communities.

### Objective
Build a **real-time surplus food redistribution platform** that enables:
- **Donors** (restaurants, hotels, canteens, event organizers) to post surplus food with a strict freshness window
- **NGOs / Food Banks** to discover, claim, and receive surplus food
- **Volunteers** to handle last-mile pickup and delivery logistics
- **Administrators** to monitor platform health, trust scores, and analytics

All food must be claimed and delivered within a **~2 hour window** from posting to ensure food safety.

### Target Users

| Role | Description | Primary Actions |
|------|-------------|-----------------|
| **Donor** | Restaurant, hotel, canteen, event organizer | Post surplus food, accept/reject NGO claims, track donation history |
| **NGO / Receiver** | Food bank, shelter, community kitchen | Browse available food, claim listings, confirm pickup |
| **Volunteer** | Delivery partner with transportation | Accept delivery tasks, navigate to pickup/drop, confirm handoff |
| **Admin** | Platform operator | Monitor stats, manage users, handle trust issues, view analytics |

---

## 2. Final Feature List (Refined)

### Core Features (MVP — Must Build)

| # | Feature | Description |
|---|---------|-------------|
| 1 | **User Registration & Auth** | Role-based registration (Donor/NGO/Volunteer/Admin) with JWT authentication and bcrypt password hashing |
| 2 | **Donor: Post Surplus Food** | Form with food type (VEG/NON-VEG), description, quantity (servings), pickup window, hygiene self-certification |
| 3 | **Expiry Timer System** | Auto-calculated 2-hour window from `created_at`; real-time countdown on frontend; auto-expire via backend cron |
| 4 | **NGO: Browse & Claim** | Live feed of available listings with food type badges, donor info, quantity, time remaining; one-click claim |
| 5 | **Donor: Accept/Reject Claims** | Incoming request queue with NGO details; accept or reject with one click |
| 6 | **Volunteer Assignment** | After donor accepts, system matches nearest available volunteer; volunteer sees pickup/drop task |
| 7 | **Pickup Confirmation** | Volunteer confirms pickup from donor; NGO confirms receipt — completes the chain |
| 8 | **Role-Based Dashboards** | Dedicated dashboards for Donor, NGO, Volunteer, Admin with real-time data |
| 9 | **Admin Analytics** | Platform-wide stats: meals saved, active donors, receivers helped, trust score issues |
| 10 | **Real-Time Updates** | Polling-based (10s interval) or WebSocket live updates for listings and requests |

### Enhanced Features (Post-MVP — Build if Time Allows)

| # | Feature | Description |
|---|---------|-------------|
| 11 | **Trust Score System** | Score per user (starts at 5.0/10); increases on successful deliveries, decreases on cancellations/no-shows |
| 12 | **Geolocation & Distance** | Donor address geocoding; NGO proximity filtering; volunteer route optimization |
| 13 | **Push Notifications** | Browser notifications for new listings (NGO), new claims (Donor), task assignments (Volunteer) |
| 14 | **Food Photo Upload** | Donors can attach a photo of the surplus food for transparency |
| 15 | **Impact Dashboard** | CO2 saved calculator, meals distributed chart, weekly/monthly trends |
| 16 | **Mobile-Responsive PWA** | Progressive Web App with offline indicators and install prompt |
| 17 | **QR Handoff Verification** | Generate QR code on claim; volunteer scans at pickup; NGO scans at delivery for verified chain of custody |
| 18 | **Export Reports** | CSV/PDF export of donation history for donors and NGOs |

---

## 3. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT TIER                       │
│              React.js SPA (Vite)                     │
│   ┌──────────┬──────────┬──────────┬──────────┐     │
│   │  Donor   │   NGO    │Volunteer │  Admin   │     │
│   │Dashboard │Dashboard │Dashboard │Dashboard │     │
│   └────┬─────┴────┬─────┴────┬─────┴────┬─────┘     │
│        │          │          │          │             │
│        └──────────┴──────────┴──────────┘             │
│                        │                             │
│              Axios HTTP Client                       │
│              (JWT in Auth Header)                    │
└────────────────────────┬─────────────────────────────┘
                         │ REST API (JSON)
                         ▼
┌─────────────────────────────────────────────────────┐
│                   SERVER TIER                        │
│             Node.js + Express.js                     │
│                                                     │
│   ┌──────────────────────────────────────────┐      │
│   │           Middleware Layer                │      │
│   │  CORS │ Auth (JWT) │ Rate Limit │ Logger │      │
│   └──────────────────────────────────────────┘      │
│   ┌──────────────────────────────────────────┐      │
│   │           Route Layer                    │      │
│   │  /auth │ /food │ /requests │ /volunteers │      │
│   │  /admin │ /users                         │      │
│   └──────────────────────────────────────────┘      │
│   ┌──────────────────────────────────────────┐      │
│   │         Service / Logic Layer            │      │
│   │  AuthService │ FoodService │ MatchService│      │
│   │  VolunteerService │ AdminService         │      │
│   └──────────────────────────────────────────┘      │
│   ┌──────────────────────────────────────────┐      │
│   │          Data Access Layer               │      │
│   │       mysql2 Connection Pool             │      │
│   └──────────────────────────────────────────┘      │
│   ┌──────────────────────────────────────────┐      │
│   │        Background Jobs (node-cron)       │      │
│   │  Expire stale listings │ Trust score     │      │
│   │  recalculation │ Stats aggregation       │      │
│   └──────────────────────────────────────────┘      │
└────────────────────────┬─────────────────────────────┘
                         │ mysql2 (pooled)
                         ▼
┌─────────────────────────────────────────────────────┐
│                  DATABASE TIER                       │
│             MySQL 8.x (Aiven Managed)               │
│                                                     │
│   Tables: users, donors, receivers,                 │
│   delivery_partners, food_listings,                 │
│   food_requests, deliveries, trust_logs             │
└─────────────────────────────────────────────────────┘
```

### Component Interaction Flow

```
Donor posts food ──► food_listings (AVAILABLE)
                           │
                           ▼
            NGO sees listing in live feed
                           │
                     NGO clicks "Claim"
                           │
                           ▼
              food_requests (PENDING) created
              food_listings status → REQUESTED
                           │
                           ▼
              Donor sees incoming request
              Donor clicks "Accept" or "Reject"
                           │
                    ┌──────┴──────┐
                    ▼             ▼
              ACCEPTED        REJECTED
         listing→ACCEPTED  listing→AVAILABLE
                    │
                    ▼
          Volunteer assigned (deliveries table)
          Volunteer picks up from Donor
          Volunteer delivers to NGO
                    │
                    ▼
           Both confirm handoff
           request→FULFILLED
           listing→FULFILLED
           Trust scores updated
```

---

## 4. User Roles & Flows

### 4.1 Donor Flow (Restaurant / Hotel / Canteen)

```
1. Register → name, phone, email, password, address, role=DONOR
2. Login → JWT issued → redirect to Donor Dashboard
3. Dashboard shows:
   a. "Post Surplus Food" form (always visible at top)
   b. Active Listings table (AVAILABLE / REQUESTED / ACCEPTED)
   c. Incoming Requests table (PENDING claims from NGOs)
   d. Donation History table (FULFILLED / EXPIRED / CANCELLED)
4. Post food:
   - Description (text)
   - Quantity (number of servings)
   - Food type (VEG / NON_VEG)
   - Hygiene confirmed (checkbox, required)
   - System auto-sets: created_at, expires_at (created_at + 2hr)
5. When NGO claims → donor sees in "Incoming Requests"
6. Accept → listing moves to ACCEPTED; volunteer assignment triggered
7. Reject → listing goes back to AVAILABLE for others to claim
8. After volunteer pickup → listing becomes FULFILLED
9. Logout → clear JWT → redirect to auth
```

### 4.2 NGO / Receiver Flow

```
1. Register → name, phone, email, password, address, capacity, role=RECEIVER
2. Login → JWT issued → redirect to NGO Dashboard
3. Dashboard shows:
   a. Stats cards (Meals Received Today, Active Deliveries, Active Volunteers, CO2 Saved)
   b. "Available Surplus Food" live feed (cards with food details + "Claim" button)
   c. "My Request History" table (all past claims with status tracking)
4. Browse available food:
   - Each card shows: description, donor name, food type badge, quantity, time remaining
   - "Claim This" button triggers POST /api/requests
5. After claiming:
   - Request appears in history as PENDING
   - When donor accepts → status changes to APPROVED
   - "Confirm Pickup" button appears on APPROVED requests
   - Click to mark FULFILLED
6. Logout
```

### 4.3 Volunteer Flow

```
1. Register → name, phone, vehicle type, availability zone, role=VOLUNTEER
2. Login → JWT issued → redirect to Volunteer Dashboard
3. Dashboard shows:
   a. Available delivery tasks (ACCEPTED claims needing pickup)
   b. My active task (current assignment with pickup/drop details)
   c. Task history (completed deliveries)
4. Accept task:
   - Shows donor name, address, phone
   - Shows NGO name, address, phone
   - Estimated distance (if geolocation enabled)
5. At donor location → "Confirm Pickup" button
6. At NGO location → "Confirm Delivery" button
7. Task marked DELIVERED → trust scores updated
```

### 4.4 Admin Flow

```
1. Login with admin credentials
2. Dashboard shows:
   a. Platform stats (meals saved, active donors, receivers helped, trust issues)
   b. User management table (all users with role, trust score, status)
   c. Active listings overview
   d. Trust incident log (flagged users, cancellation reports)
   e. System health monitor
3. Actions: ban/unban users, reset trust scores, export reports
```

---

## 5. Database Design (MySQL)

### Entity-Relationship Overview

```
users (1) ──── (1) donors
users (1) ──── (1) receivers
users (1) ──── (1) delivery_partners
donors (1) ──── (N) food_listings
food_listings (1) ──── (N) food_requests
food_requests (1) ──── (0..1) deliveries
receivers (1) ──── (N) food_requests
delivery_partners (1) ──── (N) deliveries
```

### Table Definitions

#### `users`
```sql
CREATE TABLE users (
    user_id       INT AUTO_INCREMENT PRIMARY KEY,
    role          ENUM('DONOR', 'RECEIVER', 'VOLUNTEER', 'ADMIN') NOT NULL,
    name          VARCHAR(255) NOT NULL,
    phone         VARCHAR(20) NOT NULL UNIQUE,
    email         VARCHAR(255) DEFAULT NULL,
    password_hash VARCHAR(255) NOT NULL,
    address       TEXT DEFAULT NULL,
    latitude      DECIMAL(10, 8) DEFAULT NULL,
    longitude     DECIMAL(11, 8) DEFAULT NULL,
    is_verified   BOOLEAN DEFAULT FALSE,
    trust_score   DECIMAL(4, 2) DEFAULT 5.00,
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role),
    INDEX idx_phone (phone),
    INDEX idx_trust (trust_score)
);
```

#### `donors`
```sql
CREATE TABLE donors (
    donor_id         INT PRIMARY KEY,
    organization_type ENUM('RESTAURANT', 'HOTEL', 'CANTEEN', 'EVENT', 'OTHER') DEFAULT 'OTHER',
    fssai_license    VARCHAR(50) DEFAULT NULL,
    avg_daily_surplus INT DEFAULT 0,
    FOREIGN KEY (donor_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

#### `receivers`
```sql
CREATE TABLE receivers (
    receiver_id       INT PRIMARY KEY,
    organization_name VARCHAR(255) DEFAULT NULL,
    capacity          INT DEFAULT 50,
    beneficiaries     INT DEFAULT 0,
    FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

#### `delivery_partners`
```sql
CREATE TABLE delivery_partners (
    partner_id    INT PRIMARY KEY,
    vehicle_type  ENUM('BIKE', 'CAR', 'VAN', 'WALK') DEFAULT 'BIKE',
    is_available  BOOLEAN DEFAULT TRUE,
    current_lat   DECIMAL(10, 8) DEFAULT NULL,
    current_lng   DECIMAL(11, 8) DEFAULT NULL,
    total_deliveries INT DEFAULT 0,
    FOREIGN KEY (partner_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

#### `food_listings`
```sql
CREATE TABLE food_listings (
    food_id           INT AUTO_INCREMENT PRIMARY KEY,
    donor_id          INT NOT NULL,
    food_type         ENUM('VEG', 'NON_VEG', 'MIXED') NOT NULL,
    description       VARCHAR(500) NOT NULL,
    quantity           INT NOT NULL COMMENT 'Number of servings',
    hygiene_confirmed BOOLEAN DEFAULT FALSE,
    status            ENUM('AVAILABLE', 'REQUESTED', 'ACCEPTED', 'FULFILLED', 'EXPIRED', 'CANCELLED') DEFAULT 'AVAILABLE',
    pickup_address    TEXT DEFAULT NULL,
    pickup_lat        DECIMAL(10, 8) DEFAULT NULL,
    pickup_lng        DECIMAL(11, 8) DEFAULT NULL,
    prepared_at       TIMESTAMP DEFAULT NULL,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at        TIMESTAMP DEFAULT NULL COMMENT 'Auto-set to created_at + 2 hours',
    pickup_start      TIMESTAMP DEFAULT NULL,
    pickup_end        TIMESTAMP DEFAULT NULL,
    FOREIGN KEY (donor_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_donor (donor_id),
    INDEX idx_created (created_at),
    INDEX idx_expires (expires_at)
);
```

#### `food_requests`
```sql
CREATE TABLE food_requests (
    request_id     INT AUTO_INCREMENT PRIMARY KEY,
    food_id        INT NOT NULL,
    receiver_id    INT NOT NULL,
    request_status ENUM('PENDING', 'APPROVED', 'REJECTED', 'FULFILLED', 'CANCELLED') DEFAULT 'PENDING',
    requested_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at   TIMESTAMP DEFAULT NULL,
    notes          TEXT DEFAULT NULL,
    FOREIGN KEY (food_id) REFERENCES food_listings(food_id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_food (food_id),
    INDEX idx_receiver (receiver_id),
    INDEX idx_status (request_status)
);
```

#### `deliveries`
```sql
CREATE TABLE deliveries (
    delivery_id    INT AUTO_INCREMENT PRIMARY KEY,
    request_id     INT NOT NULL UNIQUE,
    volunteer_id   INT NOT NULL,
    status         ENUM('ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED') DEFAULT 'ASSIGNED',
    assigned_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    picked_up_at   TIMESTAMP DEFAULT NULL,
    delivered_at   TIMESTAMP DEFAULT NULL,
    distance_km    DECIMAL(6, 2) DEFAULT NULL,
    notes          TEXT DEFAULT NULL,
    FOREIGN KEY (request_id) REFERENCES food_requests(request_id) ON DELETE CASCADE,
    FOREIGN KEY (volunteer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_volunteer (volunteer_id),
    INDEX idx_status (status)
);
```

#### `trust_logs`
```sql
CREATE TABLE trust_logs (
    log_id      INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    action      ENUM('DONATION_COMPLETE', 'PICKUP_COMPLETE', 'DELIVERY_COMPLETE', 'NO_SHOW', 'CANCELLED', 'REPORTED') NOT NULL,
    delta       DECIMAL(3, 2) NOT NULL COMMENT '+0.25 or -0.50 etc.',
    new_score   DECIMAL(4, 2) NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

---

## 6. Backend Design (Node.js + Express)

### NPM Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.x",
    "mysql2": "^3.x",
    "bcryptjs": "^2.4.x",
    "jsonwebtoken": "^9.x",
    "cors": "^2.8.x",
    "dotenv": "^16.x",
    "helmet": "^7.x",
    "express-rate-limit": "^7.x",
    "express-validator": "^7.x",
    "node-cron": "^3.x",
    "morgan": "^1.x"
  },
  "devDependencies": {
    "nodemon": "^3.x"
  }
}
```

### API Route Structure

#### Authentication — `/api/auth`
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/auth/register` | Register new user (any role) | None |
| POST | `/api/auth/login` | Login, returns JWT + user object | None |
| GET | `/api/auth/me` | Get current user from JWT | Required |
| PUT | `/api/auth/profile` | Update profile info | Required |

#### Food Listings — `/api/food`
| Method | Route | Description | Auth | Role |
|--------|-------|-------------|------|------|
| POST | `/api/food` | Create new food listing | Required | DONOR |
| GET | `/api/food` | Get all AVAILABLE listings (with donor join) | Required | NGO |
| GET | `/api/food/donor/:donorId` | Get donor's own listings (all statuses) | Required | DONOR |
| GET | `/api/food/:foodId` | Get single listing detail | Required | Any |
| PUT | `/api/food/:foodId/cancel` | Cancel a listing | Required | DONOR |

#### Food Requests — `/api/requests`
| Method | Route | Description | Auth | Role |
|--------|-------|-------------|------|------|
| POST | `/api/requests` | Claim a food listing | Required | NGO |
| GET | `/api/requests/donor/:donorId` | Get incoming requests for donor | Required | DONOR |
| GET | `/api/requests/receiver/:receiverId` | Get receiver's request history | Required | NGO |
| PUT | `/api/requests/:requestId/accept` | Accept a claim | Required | DONOR |
| PUT | `/api/requests/:requestId/reject` | Reject a claim | Required | DONOR |
| PUT | `/api/requests/:requestId/pickup` | Confirm food picked up | Required | NGO/VOLUNTEER |

#### Volunteers — `/api/volunteers`
| Method | Route | Description | Auth | Role |
|--------|-------|-------------|------|------|
| GET | `/api/volunteers/available` | Get available volunteers | Required | ADMIN |
| GET | `/api/volunteers/tasks` | Get tasks assigned to current volunteer | Required | VOLUNTEER |
| PUT | `/api/volunteers/tasks/:deliveryId/pickup` | Confirm volunteer picked up food | Required | VOLUNTEER |
| PUT | `/api/volunteers/tasks/:deliveryId/deliver` | Confirm volunteer delivered food | Required | VOLUNTEER |
| PUT | `/api/volunteers/availability` | Toggle volunteer availability | Required | VOLUNTEER |

#### Admin — `/api/admin`
| Method | Route | Description | Auth | Role |
|--------|-------|-------------|------|------|
| GET | `/api/admin/stats` | Platform-wide statistics | Required | ADMIN |
| GET | `/api/admin/users` | All users with filters | Required | ADMIN |
| PUT | `/api/admin/users/:userId/ban` | Ban/unban a user | Required | ADMIN |
| GET | `/api/admin/trust-logs` | Trust score change history | Required | ADMIN |

### Service Layer Design

```
services/
├── authService.js        # register, login, hashPassword, verifyToken
├── foodService.js        # createListing, getAvailable, getDonorListings, expireStale
├── requestService.js     # createRequest, accept, reject, markPickup
├── volunteerService.js   # assignVolunteer, updateTaskStatus, toggleAvailability
├── adminService.js       # getStats, getUsers, banUser, getTrustLogs
├── trustService.js       # updateTrustScore, logTrustAction
└── cronJobs.js           # Auto-expire listings past 2hr window
```

### Key Middleware

```javascript
// auth.js — JWT verification middleware
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Authentication required' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// authorize.js — Role-based access control
const authorize = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
};
```

### Cron Job — Auto-Expire Listings

```javascript
// runs every 5 minutes
cron.schedule('*/5 * * * *', async () => {
    const [result] = await pool.execute(
        `UPDATE food_listings
         SET status = 'EXPIRED'
         WHERE status = 'AVAILABLE'
         AND expires_at < NOW()`
    );
    if (result.affectedRows > 0) {
        console.log(`[CRON] Expired ${result.affectedRows} stale listings`);
    }
});
```

---

## 7. Frontend Structure (React.js)

### Pages

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Hero section, how it works, stats, CTA |
| Login | `/login` | Email/phone + password + role select |
| Register | `/register` | Full registration form with role selection |
| Donor Dashboard | `/donor` | Post food, active listings, incoming requests, history |
| NGO Dashboard | `/ngo` | Available food feed, claim food, request history |
| Volunteer Dashboard | `/volunteer` | Available tasks, active task, delivery history |
| Admin Dashboard | `/admin` | Stats, user management, trust logs |
| Not Found | `*` | 404 page |

### Component Architecture

```
src/
├── components/
│   ├── common/
│   │   ├── Navbar.jsx              # Role-aware navigation bar
│   │   ├── Footer.jsx              # Global footer
│   │   ├── ProtectedRoute.jsx      # Auth guard for routes
│   │   ├── LoadingSpinner.jsx      # Reusable spinner
│   │   ├── StatusBadge.jsx         # Color-coded status pill
│   │   ├── CountdownTimer.jsx      # Real-time expiry countdown
│   │   ├── StatCard.jsx            # Dashboard metric card
│   │   ├── EmptyState.jsx          # "No data" placeholder
│   │   └── Toast.jsx               # Success/error notifications
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   └── RegisterForm.jsx
│   ├── donor/
│   │   ├── PostFoodForm.jsx        # Surplus food posting form
│   │   ├── ActiveListings.jsx      # Table of current listings
│   │   ├── IncomingRequests.jsx     # Pending claims with Accept/Reject
│   │   └── DonationHistory.jsx     # Past donations table
│   ├── ngo/
│   │   ├── FoodFeed.jsx            # Available surplus food cards
│   │   ├── FoodCard.jsx            # Individual food listing card
│   │   └── RequestHistory.jsx      # NGO's request history table
│   ├── volunteer/
│   │   ├── AvailableTasks.jsx      # Unassigned delivery tasks
│   │   ├── ActiveTask.jsx          # Current delivery in progress
│   │   └── DeliveryHistory.jsx     # Completed deliveries
│   └── admin/
│       ├── PlatformStats.jsx       # Overview stat cards
│       ├── UserManagement.jsx      # User table with actions
│       └── TrustLogs.jsx           # Trust score change log
├── pages/
│   ├── LandingPage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── DonorDashboard.jsx
│   ├── NgoDashboard.jsx
│   ├── VolunteerDashboard.jsx
│   ├── AdminDashboard.jsx
│   └── NotFoundPage.jsx
├── hooks/
│   ├── useAuth.js                  # Authentication state & actions
│   ├── useApi.js                   # Axios wrapper with JWT injection
│   └── usePolling.js               # Auto-refresh hook (10s interval)
├── context/
│   └── AuthContext.jsx             # Global auth state provider
├── services/
│   └── api.js                      # Centralized API client (Axios)
├── utils/
│   ├── constants.js                # API_BASE_URL, ROLES, STATUSES
│   ├── formatters.js               # Date, time, number formatters
│   └── validators.js               # Form validation helpers
├── App.jsx                          # Root component with Router
├── main.jsx                         # Vite entry point
└── index.css                        # Global styles
```

### State Management

**Approach:** React Context API + `useReducer` (no Redux needed for this scope)

- **AuthContext** — stores [user](file:///c:/Hackathon/LeftoverPantry/backend/main.py#90-151), `token`, `isAuthenticated`, `login()`, `logout()`, [register()](file:///c:/Hackathon/LeftoverPantry/frontend/js/api.js#31-35)
- **Component-level state** — each dashboard page manages its own data via `useState` + `useEffect` with the `usePolling` hook for auto-refresh

### Key React Patterns

```jsx
// usePolling.js — Auto-refresh hook
import { useEffect, useRef } from 'react';

export function usePolling(callback, intervalMs = 10000) {
    const savedCallback = useRef();

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        savedCallback.current(); // initial call
        const id = setInterval(() => savedCallback.current(), intervalMs);
        return () => clearInterval(id);
    }, [intervalMs]);
}
```

```jsx
// CountdownTimer.jsx — Expiry countdown
export function CountdownTimer({ expiresAt }) {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const timer = setInterval(() => {
            const diff = new Date(expiresAt) - new Date();
            if (diff <= 0) {
                setTimeLeft('EXPIRED');
                clearInterval(timer);
            } else {
                const mins = Math.floor(diff / 60000);
                const secs = Math.floor((diff % 60000) / 1000);
                setTimeLeft(`${mins}m ${secs}s`);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [expiresAt]);

    return <span className={timeLeft === 'EXPIRED' ? 'text-red-500' : 'text-amber-500'}>{timeLeft}</span>;
}
```

---

## 8. Folder Structure (Clean)

```
foodlink/
├── client/                          # React Frontend (Vite)
│   ├── public/
│   │   ├── favicon.ico
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── auth/
│   │   │   ├── donor/
│   │   │   ├── ngo/
│   │   │   ├── volunteer/
│   │   │   └── admin/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   ├── assets/
│   │   │   └── images/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js          # Only if using Tailwind
│   ├── postcss.config.js
│   └── package.json
│
├── server/                          # Node.js Backend (Express)
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js               # MySQL pool configuration
│   │   │   └── env.js              # Environment variables loader
│   │   ├── middleware/
│   │   │   ├── auth.js             # JWT verification
│   │   │   ├── authorize.js        # Role-based access
│   │   │   ├── errorHandler.js     # Global error handler
│   │   │   ├── rateLimiter.js      # Rate limiting config
│   │   │   └── validator.js        # Request validation schemas
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── foodRoutes.js
│   │   │   ├── requestRoutes.js
│   │   │   ├── volunteerRoutes.js
│   │   │   └── adminRoutes.js
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   ├── foodService.js
│   │   │   ├── requestService.js
│   │   │   ├── volunteerService.js
│   │   │   ├── adminService.js
│   │   │   └── trustService.js
│   │   ├── jobs/
│   │   │   └── cronJobs.js         # Scheduled tasks
│   │   ├── utils/
│   │   │   ├── helpers.js          # Date formatting, IST time
│   │   │   └── responses.js        # Standardized API responses
│   │   └── app.js                  # Express app setup
│   ├── server.js                    # Entry point (starts server)
│   ├── .env                         # Environment variables
│   ├── .env.example                 # Template for env vars
│   └── package.json
│
├── database/
│   └── schema.sql                   # Full MySQL schema (all CREATE TABLE statements)
│
├── .gitignore
└── README.md
```

### Environment Variables (`.env`)

```env
# Server
NODE_ENV=development
PORT=8000

# Database (Aiven MySQL)
DB_HOST=your-aiven-host.aivencloud.com
DB_PORT=12345
DB_USER=avnadmin
DB_PASSWORD=your-aiven-password
DB_NAME=foodlink
DB_SSL=true

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:5173
```

---

## 9. Core Logic Systems

### 9.1 Expiry Timer System

**Backend:**
- When creating a food listing, auto-calculate `expires_at = created_at + 2 hours`
- Cron job runs every 5 minutes: marks AVAILABLE listings past `expires_at` as EXPIRED
- Cron also handles REQUESTED listings: if `expires_at` passed and still REQUESTED → mark EXPIRED + reject pending requests

**Frontend:**
- `CountdownTimer` component reads `expires_at` from listing data
- Updates every second via `setInterval`
- Visual indicators: green (>60min), amber (15–60min), red (<15min), blinking red (<5min)
- When expired, button is disabled and badge shows "EXPIRED"

```javascript
// Backend: Auto-set expires_at on creation
const createListing = async (data) => {
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // +2 hours
    const [result] = await pool.execute(
        `INSERT INTO food_listings
         (donor_id, food_type, description, quantity, hygiene_confirmed, status, created_at, expires_at)
         VALUES (?, ?, ?, ?, ?, 'AVAILABLE', NOW(), ?)`,
        [data.donor_id, data.food_type, data.description, data.quantity, data.hygiene_confirmed, expiresAt]
    );
    return result.insertId;
};
```

### 9.2 Claim System

**Rules:**
1. Only NGOs with role=RECEIVER can claim
2. A listing can only have ONE active claim at a time (status transitions to REQUESTED)
3. If donor rejects → listing goes back to AVAILABLE for others
4. If donor accepts → listing moves to ACCEPTED
5. Only AVAILABLE listings appear in the NGO feed
6. Duplicate claims by same NGO on same listing are prevented

```javascript
const claimFood = async (foodId, receiverId) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // Check listing is still AVAILABLE
        const [listing] = await conn.execute(
            'SELECT status, expires_at FROM food_listings WHERE food_id = ? FOR UPDATE',
            [foodId]
        );

        if (!listing[0] || listing[0].status !== 'AVAILABLE') {
            throw new Error('Food is no longer available');
        }
        if (new Date(listing[0].expires_at) < new Date()) {
            throw new Error('This listing has expired');
        }

        // Check for duplicate
        const [existing] = await conn.execute(
            'SELECT request_id FROM food_requests WHERE food_id = ? AND receiver_id = ? AND request_status = "PENDING"',
            [foodId, receiverId]
        );
        if (existing.length > 0) throw new Error('You have already claimed this listing');

        // Create request
        await conn.execute(
            'INSERT INTO food_requests (food_id, receiver_id, request_status, requested_at) VALUES (?, ?, "PENDING", NOW())',
            [foodId, receiverId]
        );

        // Update listing status
        await conn.execute(
            'UPDATE food_listings SET status = "REQUESTED" WHERE food_id = ?',
            [foodId]
        );

        await conn.commit();
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};
```

### 9.3 Matching Logic (Donor ↔ NGO)

**Current approach (MVP):**
- The NGO manually browses available listings and claims
- One-to-one: one claim per listing at a time
- Donor explicitly accepts/rejects

**Future enhancement (post-MVP):**
- Auto-match based on: proximity (NGO address vs donor address), capacity, food type preference
- Priority queue for NGOs with higher trust scores
- Smart notifications to nearest NGOs first

### 9.4 Volunteer Assignment

**MVP approach:**
1. When donor ACCEPTS a claim, create a delivery record with status=ASSIGNED
2. All available volunteers see this task in their "Available Tasks" feed
3. First volunteer to accept gets the assignment (first-come-first-serve)
4. Volunteer workflow: Accept Task → Pickup Confirmed → Delivery Confirmed

```javascript
const assignVolunteer = async (requestId, volunteerId) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // Check no existing assignment
        const [existing] = await conn.execute(
            'SELECT delivery_id FROM deliveries WHERE request_id = ?',
            [requestId]
        );
        if (existing.length > 0) throw new Error('Task already assigned');

        // Create delivery
        await conn.execute(
            `INSERT INTO deliveries (request_id, volunteer_id, status, assigned_at)
             VALUES (?, ?, 'ASSIGNED', NOW())`,
            [requestId, volunteerId]
        );

        // Mark volunteer busy
        await conn.execute(
            'UPDATE delivery_partners SET is_available = FALSE WHERE partner_id = ?',
            [volunteerId]
        );

        await conn.commit();
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};
```

---

## 10. Improvements Over Old Project

### What Was Wrong

| Issue | Details |
|-------|---------|
| **Python backend** | Used Flask with Python — must be Node.js + Express for hackathon requirements |
| **No authentication** | Registration doubled as login; no JWT; passwords stored in plain text |
| **No volunteer system** | `DELIVERY` role existed in DB but had zero API routes or UI |
| **Duplicate HTML pages** | [hotel-dashboard.html](file:///c:/Hackathon/LeftoverPantry/frontend/hotel-dashboard.html) and [hotel-add-surplus.html](file:///c:/Hackathon/LeftoverPantry/frontend/hotel-add-surplus.html) had identical content |
| **Duplicate JS logic** | [donor.js](file:///c:/Hackathon/LeftoverPantry/frontend/js/donor.js) and [hotel.js](file:///c:/Hackathon/LeftoverPantry/frontend/js/hotel.js) had nearly identical logic; [receiver.js](file:///c:/Hackathon/LeftoverPantry/frontend/js/receiver.js) and [ngo.js](file:///c:/Hackathon/LeftoverPantry/frontend/js/ngo.js) same issue |
| **No expiry system** | `expires_at` field existed in DB but was never populated or checked |
| **Static HTML** | No component reuse; each page was a fully separate HTML file with copy-pasted navbar/footer |
| **Tailwind via CDN** | Used Tailwind CDN script which is not production-ready |
| **Inconsistent CSS** | Mixed Tailwind classes, custom CSS, and inline styles |
| **No input validation** | No server-side or client-side validation |
| **No error boundaries** | Errors in one component break entire page |
| **Requirements mismatch** | [requirements.txt](file:///c:/Hackathon/LeftoverPantry/backend/requirements.txt) listed `fastapi` but code used `flask` |
| **Hardcoded credentials** | Database password (`'khushi'`) hardcoded in source |
| **No HTTPS/security** | No helmet, no rate limiting, no SQL injection prevention |
| **Session via localStorage only** | No token expiry, no server-side session validation |
| **Admin dashboard is a mock** | Trust issues table shows "No active issues" placeholder text only |

### What Is Improved in New Design

| Area | Improvement |
|------|-------------|
| **Tech stack** | Migrated to React.js + Node.js (Express) + MySQL as required |
| **Authentication** | Proper JWT auth with bcrypt password hashing, token expiry, middleware guards |
| **Component architecture** | Reusable React components; no duplicated code across pages |
| **Volunteer system** | Full delivery workflow: task assignment → pickup → delivery → confirmation |
| **Expiry timer** | Automatic 2-hour window with real-time countdown on frontend and backend cron cleanup |
| **Input validation** | express-validator on backend; controlled form validation on frontend |
| **Security** | Helmet headers, CORS config, rate limiting, parameterized queries, env variables |
| **Role-based access** | Middleware ensures only correct roles access their endpoints |
| **Database design** | Properly indexed tables, foreign keys, ENUMs, the `deliveries` and `trust_logs` tables added |
| **Error handling** | Centralized error handler middleware; React error boundaries |
| **State management** | React Context + hooks instead of scattered localStorage reads |
| **Auto-refresh** | Custom `usePolling` hook for clean, consistent data refresh across dashboards |
| **Scalable folder structure** | Clean separation of concerns: routes, services, middleware, utils |

---

## 11. Hackathon Execution Plan

### Phase 1: Foundation (~2 hours)

**Priority: CRITICAL — Do first**

1. **Setup project scaffolding**
   - Initialize Vite + React frontend (`npx create-vite client --template react`)
   - Initialize Express backend (`npm init` in `server/`)
   - Install all dependencies
   - Configure `.env` with Aiven MySQL credentials

2. **Database setup**
   - Run `schema.sql` on Aiven MySQL to create all tables
   - Test connection from Express with `mysql2` pool

3. **Authentication system**
   - `POST /api/auth/register` — bcrypt hash, insert user + role sub-table
   - `POST /api/auth/login` — verify password, issue JWT
   - JWT middleware (`auth.js`, `authorize.js`)
   - React `AuthContext` + `LoginPage` + `RegisterPage`

### Phase 2: Core Food Lifecycle (~3 hours)

**Priority: HIGH — This is the main demo**

4. **Donor: Post surplus food**
   - `POST /api/food` endpoint with validation
   - `PostFoodForm` React component
   - Auto-set `expires_at` on backend

5. **NGO: Browse & claim food**
   - `GET /api/food` endpoint (AVAILABLE only, with donor join)
   - `FoodFeed` + `FoodCard` components with countdown timer
   - `POST /api/requests` to claim

6. **Donor: Accept/Reject claims**
   - `GET /api/requests/donor/:id` endpoint
   - [IncomingRequests](file:///c:/Hackathon/LeftoverPantry/frontend/js/hotel.js#139-174) component with Accept/Reject buttons
   - Status transitions with transaction safety

7. **Pickup confirmation**
   - `PUT /api/requests/:id/pickup` endpoint
   - NGO's "Confirm Pickup" button on APPROVED requests

### Phase 3: Volunteer & Admin (~2 hours)

**Priority: MEDIUM — Differentiator for judges**

8. **Volunteer dashboard**
   - Available tasks feed, accept task, confirm pickup/delivery
   - Delivery table tracking

9. **Admin dashboard**
   - Platform stats endpoint
   - Real stat cards with live data
   - User table (basic)

### Phase 4: Polish (~1 hour)

**Priority: NICE-TO-HAVE — Only if time allows**

10. **Expiry cron job** — auto-expire old listings
11. **Real-time countdown timers** on all food cards
12. **Responsive design** — ensure mobile works
13. **Trust score system** — basic implementation
14. **Landing page** — hero section with animated stats

### What to Skip If Time Is Limited

| Skip | Reason |
|------|--------|
| Photo upload | Complex (need cloud storage or base64); not core |
| Geolocation/distance | Requires geocoding API; not core |
| QR handoff verification | Complex; nice but not essential |
| Export reports | Low impact for demo |
| Push notifications | Polling is sufficient for demo |
| PWA features | Not core functionality |
| CO2 calculator | Can be a static estimate in the UI |

### High-Impact Features for Judging

| Feature | Why It Impresses |
|---------|-----------------|
| **Live countdown timer** | Shows urgency, real-time feel, technically impressive |
| **Full claim lifecycle** | Donor posts → NGO claims → Donor accepts → Volunteer delivers → Confirmed |
| **Role-based dashboards** | Shows system design depth; each role has unique UX |
| **Trust score system** | Shows thoughtful design for accountability |
| **Auto-expire cron** | Shows backend engineering maturity |
| **Transaction-safe operations** | Prevents race conditions on claims; shows DB competence |
| **Clean, modern UI** | Glassmorphism, dark mode toggle, status badges, micro-animations |

---

> **This document is the complete blueprint. An AI or developer can build the entire FoodLink platform from scratch using only this specification, without needing access to the old codebase.**
