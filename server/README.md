# PBMS Node.js Backend

REST API for **Puntland Border Management System** — TAYO Software Company.

## Documentation

| File | Description |
|------|-------------|
| [docs/BMS-SYSTEM-OVERVIEW.md](./docs/BMS-SYSTEM-OVERVIEW.md) | Full product specification |
| [docs/API-REFERENCE.md](./docs/API-REFERENCE.md) | REST API endpoints |
| [docs/IMPLEMENTATION-STATUS.md](./docs/IMPLEMENTATION-STATUS.md) | Gap analysis (spec vs code) |

## Quick Start

```bash
npm install
npm run seed    # demo users + sample data
npm run dev     # http://localhost:4001
```

## Demo Logins

| Role | Email | Password |
|------|-------|----------|
| Super Admin | super@pbms.so | super123 |
| City Admin | admin.garowe@pbms.so | admin123 |
| Border Officer | officer.garowe@pbms.so | officer123 |
| Traveler | ahmed@example.com | password123 |

## Stack

- **Express** — HTTP API
- **better-sqlite3** — SQLite database (`db/bms.db`)
- **bcryptjs** — password hashing
- **jsonwebtoken** — JWT auth

## From Project Root

```bash
npm run install:all
npm run server:seed
npm run dev:all   # frontend :3000 + backend :4001
```

Frontend proxies `/api/*` → `http://localhost:4001`.
