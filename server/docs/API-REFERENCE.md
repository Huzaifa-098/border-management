# PBMS REST API Reference

Base URL: `http://localhost:4001/api`

Authentication: `Authorization: Bearer <JWT>` (except `/auth/login` and `/health`)

---

## Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login `{ email, password }` → `{ token, user }` |
| GET | `/auth/me` | Current user profile |

## Users

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/users` | Admin | List users (scoped by role) |
| POST | `/users` | CITY_ADMIN, SUPER_ADMIN | Create user/officer |
| PATCH | `/users/:id` | Admin | Update user |
| DELETE | `/users/:id` | Admin | Delete user |

## Entries (Passenger / Vehicle Applications)

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/entries` | All auth | List entries (role-scoped) |
| GET | `/entries/:id` | All auth | Single entry + audit history |
| POST | `/entries` | USER, BORDER_OFFICER | Create application |
| PATCH | `/entries/:id` | Owner | Edit (if RETURNED) |
| PATCH | `/entries/:id/status` | CITY_ADMIN, SUPER_ADMIN | Approve / reject / return |
| POST | `/entries/:id/biometric` | USER, OFFICER | Attach fingerprint/face data |

## Blacklist & Watchlist

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/blacklist` | Admin | List all |
| POST | `/blacklist` | SUPER_ADMIN | Add entry `{ listType: BLACKLIST\|WATCHLIST }` |
| DELETE | `/blacklist/:id` | SUPER_ADMIN | Remove |

## Incidents

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/incidents` | Admin | List (scoped) |
| POST | `/incidents` | All | Report incident |
| PATCH | `/incidents/:id/status` | Admin | Escalate / resolve |

## Emergencies (Panic)

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/emergencies` | Admin | Active alerts |
| POST | `/emergencies` | All | Trigger SOS `{ alertType, location }` |
| PATCH | `/emergencies/:id/resolve` | Admin | Acknowledge |

## Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | User inbox |
| PATCH | `/notifications/:id/read` | Mark read |

## Messages (Communication Center)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/messages/inbox` | Received messages |
| POST | `/messages` | Send `{ receiverId, content }` |

## Broadcasts

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/broadcasts` | Admin | List broadcasts |
| POST | `/broadcasts` | SUPER_ADMIN, CITY_ADMIN | `{ title, message, targetRole?, targetCity? }` |

## Trips & GPS

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/trips` | List trips (scoped) |
| GET | `/trips/active` | In-transit vehicles |
| PATCH | `/trips/:id/gps` | Update GPS `{ latitude, longitude, speed, status }` |

## GPS (Map)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/gps/active` | All active vehicle positions for map |

## Permits & QR

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/permits/:entryId` | Digital travel permit |
| POST | `/qr/verify` | Verify QR `{ payload }` at checkpoint |

## Reports & Analytics

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/reports/dashboard` | Admin | KPIs for dashboard |
| GET | `/reports/city/:city` | Admin | City breakdown |
| GET | `/reports/travel-trends` | SUPER_ADMIN | Trend data |

## System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/settings/logo` | System logo URL |
| GET | `/cities` | List cities |
