# 🛂 Border Management System (BMS) — Complete System Overview

**TAYO Software Company** — *Smart Solutions, Better Future*

> *"Ensuring secure travel, strengthening borders, and building a safer Somalia."*

| Field | Value |
|-------|-------|
| **Product** | Border Management System (BMS) |
| **Type** | Centralized Web-Based Platform |
| **Region** | Cities & Border Checkpoints — Somalia |
| **Document** | Complete System Overview |
| **Backend** | Node.js + Express + SQLite (`server/`) |
| **Frontend** | React + TypeScript + Vite |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Objectives](#2-objectives)
3. [Key Benefits](#3-key-benefits)
4. [Secure & Reliable Features](#4-secure--reliable-features)
5. [System Workflow](#5-system-workflow)
6. [Main System Modules](#6-main-system-modules)
7. [Communication Center Module](#7-communication-center-module)
8. [Real-Time GPS & Vehicle Tracking](#8-real-time-gps--vehicle-tracking)
9. [Driver Blacklist & Watchlist](#9-driver-blacklist--watchlist)
10. [Incident & Security Reporting](#10-incident--security-reporting)
11. [Live Dashboard & Analytics](#11-live-dashboard--analytics)
12. [Multi-Level Access Control](#12-multi-level-access-control)
13. [Emergency Alert & Panic System](#13-emergency-alert--panic-system)
14. [Automatic Notifications](#14-automatic-notifications)
15. [Digital Travel Permit](#15-digital-travel-permit)
16. [Complete Workflow (Trip / Receipt Flow)](#16-complete-workflow)
17. [System Architecture Overview](#17-system-architecture-overview)
18. [API & Implementation Status](#18-api--implementation-status)
19. [Contact](#19-contact)

---

## 1. Introduction

The Border Management System (BMS) is a centralized, web-based platform designed to register passengers and vehicles, verify travel information, strengthen border security, and improve operational efficiency across cities and border checkpoints in Somalia.

Authorized government agencies manage:

- 👤 Passenger movement
- 🚗 Vehicle registration
- 🔐 Biometric verification
- 🛡️ Security monitoring
- 📊 Reporting

…through a secure centralized database.

---

## 2. Objectives

- ✅ Register passengers traveling between cities and across international borders
- ✅ Register vehicles used for travel
- ✅ Record detailed travel information (destination, purpose)
- ✅ Verify identity using biometric authentication (fingerprint & facial recognition)
- ✅ Maintain a centralized national database
- ✅ Monitor vehicle movement
- ✅ Prevent unauthorized travel
- ✅ Improve border security
- ✅ Generate real-time reports for decision-makers

---

## 3. Key Benefits

| Benefit | Description |
|---------|-------------|
| 📝 Complete Registration | Full registration of passengers and vehicles |
| 🗄️ Centralized Database | Centralized and secure data storage |
| ⏱️ Real-Time Monitoring | Live tracking of travel activities |
| 📉 Reduced Paperwork | Digital-first workflows |
| 🤖 Automated Verification | Automated identity & document checks |
| ⚙️ Operational Efficiency | Streamlined checkpoint operations |
| 🛡️ Enhanced Security | Strengthened national security |
| 📊 Accurate Reporting | Reliable reporting & analytics |
| 🔑 Easy Access | Secure access for authorized agencies |
| 🤝 Better Coordination | Improved coordination between checkpoints |

---

## 5. System Workflow

### Approval Pipeline

```
Traveler Plans Journey
    → Registration (Border Officer / Traveler)
    → City Admin Review (verify docs & biometrics)
        → Return → re-edit
        → Reject → notify
        → Approve → PENDING_SUPER
    → Super Admin Final Approval
        → Reject → notify
        → Approve → Digital Permit + QR + Trip record
    → Checkpoint Verification (QR scan)
    → Central Database + Reports
```

### Step Details

| Step | Owner | Action |
|------|-------|--------|
| **Step 1 – Registration** | Border Officer / Traveler | Register passenger, ID, biometrics, destination, purpose |
| **Step 2 – City Admin Review** | City Administrator | Review documents & biometrics; forward or return |
| **Step 3 – Super Admin Approval** | Super Admin | Final approve/reject; authorize travel |
| **Step 4 – Vehicle Registration** | Staff / Super Admin | Vehicle no., type, owner, driver, passengers |
| **Step 5 – Central Database** | System | Store approved data; generate reports |

### Entry Status Enum

| Status | Meaning |
|--------|---------|
| `PENDING_CITY` | Awaiting city admin review |
| `RETURNED` | Sent back to applicant for correction |
| `PENDING_SUPER` | City approved; awaiting super admin |
| `APPROVED` | Final approval; permit issued |
| `REJECTED` | Denied |

---

## 6. Main System Modules

### 1️⃣ Passenger Registration
- Personal information, biometrics, travel history, QR generation

### 2️⃣ Vehicle Management
- Registration, driver assignment, status, verification, GPS

### 3️⃣ City Admin Portal
- Review applications, verify documents, monitor city, forward to super admin

### 4️⃣ Super Admin Portal
- System administration, user management, approvals, security, reports

### 5️⃣ Biometric Verification
- Fingerprint & facial recognition, duplicate detection

### 6️⃣ Reporting & Analytics
- Daily travelers, vehicles, borders, security, monthly stats

### 7️⃣ Incident & Security
- Suspicious persons/vehicles, smuggling, document forgery

### 8️⃣ Notification Module
- SMS / WhatsApp / Email (optional) — trip approval, rejection, alerts

---

## 7. Communication Center Module

| Function | Description |
|----------|-------------|
| 💬 Internal Messaging | Secure text between staff, admins, checkpoints |
| 📞 Voice Calls | Encrypted voice (planned) |
| 🎥 Video Calls | Video conferencing (Zoom module in UI) |
| 📢 Broadcast Notifications | Mass announcements by role/city |
| 🛰️ Inter-Checkpoint Comms | Direct checkpoint coordination |

**API:** `POST /api/messages`, `POST /api/broadcasts`, `GET /api/messages/inbox`

---

## 8. Real-Time GPS & Vehicle Tracking

- Live map of active approved vehicles
- Trip status: `PENDING` | `IN_TRANSIT` | `ARRIVED`
- Border crossing locations
- Alerts when blacklisted driver detected

**API:** `GET /api/gps/active`, `PATCH /api/trips/:id/gps`

---

## 9. Driver Blacklist & Watchlist

| List Type | Behavior |
|-----------|----------|
| `BLACKLIST` | Block travel; immediate alert |
| `WATCHLIST` | Flag for enhanced review |

Fields: name, passport, contact, reason, status, approval info, last attempt timestamp.

**API:** `GET/POST/DELETE /api/blacklist`

---

## 10. Incident & Security Reporting

Types: Suspicious Person, Suspicious Vehicle, Illegal Crossing, Document Forgery, Smuggling, Security Threat, Vehicle Breakdown, Medical Emergency.

Fields: location, type, severity (`LOW`|`MEDIUM`|`HIGH`|`CRITICAL`), photos, documents.

Status flow: `REPORTED` → `REVIEWING` → `ESCALATED` → `RESOLVED`

**API:** `GET/POST /api/incidents`, `PATCH /api/incidents/:id/status`

---

## 12. Multi-Level Access Control

| Role | Scope |
|------|-------|
| 👑 **Super Admin** | Entire system, all cities |
| 🏙️ **City Admin** | Assigned city + users they created |
| 👮 **Border Officer** | Register travelers; data goes to creating city admin |
| 🧍 **Traveler (USER)** | Own applications only |

### Permission Matrix

| Permission | Super Admin | City Admin | Border Officer | Traveler |
|------------|:-----------:|:----------:|:--------------:|:--------:|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Passenger Management | ✅ | ✅ | ✅ | Own only |
| Vehicle Management | ✅ | ✅ | ✅ | Own only |
| Reports | ✅ | ✅ | Limited | ❌ |
| User Management | ✅ | City only | ❌ | ❌ |
| Blacklist | ✅ | View | ❌ | ❌ |
| Settings (system) | ✅ | Profile | Profile | Profile |

---

## 13. Emergency Alert & Panic System

Alert types: `PANIC`, `SECURITY`, `MEDICAL`

Recipients: Super Admin, City Admin, security agencies, nearby checkpoints.

**API:** `POST /api/emergencies`, `PATCH /api/emergencies/:id/resolve`

---

## 15. Digital Travel Permit

Each approved traveler receives:

- 🆔 Unique Permit ID (`BMS-XXXX-XXXX`)
- 🔳 QR Code (JSON payload for verification)
- 👤 Passenger information
- 📍 Destination & 🎯 Purpose
- 📅 Issue date & ⏳ Expiry date
- ✔️ Verification status

**API:** `GET /api/permits/:entryId`, `POST /api/qr/verify`

---

## 17. System Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  Users: Traveler | Border Officer | City Admin | Super  │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│  React Frontend (port 3000)  ──proxy──►  Node API :4001 │
│  • Registration UI  • Dashboard  • GPS Map  • Messaging   │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│  Core Services: Auth (JWT) | RBAC | Audit | Notifications│
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│  SQLite Database (server/db/bms.db)                     │
│  users | entries | blacklist | incidents | trips | ...  │
└─────────────────────────────────────────────────────────┘
```

---

## 18. API & Implementation Status

See [API-REFERENCE.md](./API-REFERENCE.md) for full endpoint list.

See [IMPLEMENTATION-STATUS.md](./IMPLEMENTATION-STATUS.md) for frontend vs backend gap analysis.

### Default Demo Accounts (after `npm run server:seed`)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `super@pbms.so` | `super123` |
| City Admin | `admin.garowe@pbms.so` | `admin123` |
| Border Officer | `officer.garowe@pbms.so` | `officer123` |
| Traveler | `ahmed@example.com` | `password123` |

### Run Backend

```bash
cd server
npm install
npm run seed
npm run dev
# API: http://localhost:4001/api/health
```

### Run Full Stack

```bash
npm run install:all
npm run server:seed
npm run dev:all
```

---

## 19. Contact

**TAYO Software Company**

| | |
|---|---|
| 📞 Phone | +252 906 881 758 |
| ✉️ Email | info@tayosoftware.com |
| 🌐 Website | www.tayosoftware.com |
| 📍 Location | Somalia |

---

*Document version 1.0 — aligned with TAYO BMS product specification.*
