# FoodLink — Database Schema (MySQL 8.x)

> Copy-paste these queries directly into MySQL Workbench or any MySQL client.
> Run them in order — tables have foreign key dependencies.

---

## 1. Create Database

```sql
CREATE DATABASE IF NOT EXISTS foodlink
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE foodlink;
```

---

## 2. Users Table

```sql
CREATE TABLE users (
    user_id       INT AUTO_INCREMENT PRIMARY KEY,
    role          ENUM('DONOR', 'RECEIVER', 'VOLUNTEER', 'ADMIN') NOT NULL,
    name          VARCHAR(255) NOT NULL,
    phone         VARCHAR(20) NOT NULL UNIQUE,
    email         VARCHAR(255) DEFAULT NULL UNIQUE,
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
    INDEX idx_email (email),
    INDEX idx_trust (trust_score)
) ENGINE=InnoDB;
```

---

## 3. Donors Table

```sql
CREATE TABLE donors (
    donor_id          INT PRIMARY KEY,
    organization_type ENUM('RESTAURANT', 'HOTEL', 'CANTEEN', 'EVENT', 'OTHER') DEFAULT 'OTHER',
    fssai_license     VARCHAR(50) DEFAULT NULL,
    avg_daily_surplus INT DEFAULT 0,
    FOREIGN KEY (donor_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

---

## 4. Receivers Table

```sql
CREATE TABLE receivers (
    receiver_id       INT PRIMARY KEY,
    organization_name VARCHAR(255) DEFAULT NULL,
    capacity          INT DEFAULT 50,
    beneficiaries     INT DEFAULT 0,
    FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

---

## 5. Delivery Partners Table

```sql
CREATE TABLE delivery_partners (
    partner_id       INT PRIMARY KEY,
    vehicle_type     ENUM('BIKE', 'CAR', 'VAN', 'WALK') DEFAULT 'BIKE',
    is_available     BOOLEAN DEFAULT TRUE,
    current_lat      DECIMAL(10, 8) DEFAULT NULL,
    current_lng      DECIMAL(11, 8) DEFAULT NULL,
    total_deliveries INT DEFAULT 0,
    FOREIGN KEY (partner_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

---

## 6. Food Listings Table

```sql
CREATE TABLE food_listings (
    food_id           INT AUTO_INCREMENT PRIMARY KEY,
    donor_id          INT NOT NULL,
    food_type         ENUM('VEG', 'NON_VEG', 'MIXED') NOT NULL,
    description       VARCHAR(500) NOT NULL,
    quantity          INT NOT NULL COMMENT 'Number of servings',
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
) ENGINE=InnoDB;
```

---

## 7. Food Requests Table

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
) ENGINE=InnoDB;
```

---

## 8. Deliveries Table

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
) ENGINE=InnoDB;
```

---

## 9. Trust Logs Table

```sql
CREATE TABLE trust_logs (
    log_id      INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    action      ENUM('DONATION_COMPLETE', 'PICKUP_COMPLETE', 'DELIVERY_COMPLETE', 'NO_SHOW', 'CANCELLED', 'REPORTED') NOT NULL,
    delta       DECIMAL(3, 2) NOT NULL COMMENT '+0.25 or -0.50 etc.',
    new_score   DECIMAL(4, 2) NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_action (action)
) ENGINE=InnoDB;
```

---

## 10. Seed Admin User (Optional)

```sql
-- Password: admin123 (bcrypt hash)
INSERT INTO users (role, name, phone, email, password_hash, address, trust_score, is_verified, is_active)
VALUES ('ADMIN', 'FoodLink Admin', '9999999999', 'admin@foodlink.app',
        '$2a$10$Q8H3Y9Z0X1W2V3U4T5S6ROq1p2o3n4m5l6k7j8i9h0g1f2e3d4c5b',
        'FoodLink HQ', 10.00, TRUE, TRUE);
```

---

## 11. Schema Migrations (Run After Initial Setup)

```sql
-- Add unit column to food_listings (run once)
ALTER TABLE food_listings 
ADD COLUMN unit ENUM('servings', 'kg', 'plates', 'packets', 'litres') 
NOT NULL DEFAULT 'servings' 
AFTER quantity;
```

---


> - `users (1) ─── (1) donors`
> - `users (1) ─── (1) receivers`
> - `users (1) ─── (1) delivery_partners`
> - `donors (1) ─── (N) food_listings`
> - `food_listings (1) ─── (N) food_requests`
> - `food_requests (1) ─── (0..1) deliveries`
> - `receivers (1) ─── (N) food_requests`
> - `delivery_partners (1) ─── (N) deliveries`
