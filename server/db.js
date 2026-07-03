import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "db", "bms.db");

export const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS cities (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT DEFAULT '',
    city TEXT DEFAULT '',
    role TEXT NOT NULL,
    responsibility TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    photo_url TEXT,
    created_by TEXT,
    preferences_json TEXT DEFAULT '{}',
    failed_attempts INTEGER DEFAULT 0,
    is_transferred INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS entries (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    full_name TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    photo_url TEXT,
    marital_status TEXT,
    age INTEGER,
    place_of_birth TEXT,
    guarantor_json TEXT,
    vehicle_json TEXT NOT NULL,
    vehicle_model TEXT,
    vehicle_owner TEXT,
    vehicle_ownership TEXT,
    cargo_type TEXT,
    driver_license_number TEXT,
    gps_json TEXT,
    origin_city TEXT NOT NULL,
    destination_city TEXT NOT NULL,
    purpose TEXT NOT NULL,
    journey_date TEXT,
    issue_date TEXT,
    expiry_date TEXT,
    official_role TEXT,
    department TEXT,
    badge_number TEXT,
    security_clearance TEXT,
    accompanying_persons TEXT DEFAULT '',
    passengers_json TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING_CITY',
    entry_type TEXT NOT NULL DEFAULT 'PASSENGER',
    admin_comments TEXT,
    submitted_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    created_by_officer_id TEXT,
    assigned_city TEXT,
    permit_id TEXT,
    qr_code TEXT,
    biometric_fingerprint TEXT,
    biometric_face TEXT,
    trip_status TEXT DEFAULT 'PENDING'
  );

  CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    actor_name TEXT NOT NULL,
    role TEXT NOT NULL,
    action TEXT NOT NULL,
    comments TEXT,
    FOREIGN KEY (entry_id) REFERENCES entries(id)
  );

  CREATE TABLE IF NOT EXISTS blacklist (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    passport_number TEXT,
    nationality TEXT DEFAULT 'Somalia',
    reason TEXT NOT NULL,
    added_by TEXT NOT NULL,
    added_at TEXT NOT NULL,
    photo_url TEXT,
    last_attempt_at TEXT,
    phone_number TEXT,
    age INTEGER,
    marital_status TEXT,
    list_type TEXT NOT NULL DEFAULT 'BLACKLIST'
  );

  CREATE TABLE IF NOT EXISTS incidents (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    reported_by TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    severity TEXT DEFAULT 'MEDIUM',
    timestamp TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'REPORTED',
    photo_url TEXT
  );

  CREATE TABLE IF NOT EXISTS emergency_alerts (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    user_name TEXT NOT NULL,
    user_phone TEXT,
    location TEXT,
    alert_type TEXT NOT NULL DEFAULT 'PANIC',
    timestamp TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE'
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    message TEXT NOT NULL,
    date TEXT NOT NULL,
    read INTEGER NOT NULL DEFAULT 0,
    action_url TEXT,
    channel TEXT DEFAULT 'in_app'
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    sender_id TEXT NOT NULL,
    receiver_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    sender_role TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    read INTEGER NOT NULL DEFAULT 0,
    type TEXT DEFAULT 'text',
    media_url TEXT,
    duration INTEGER,
    file_name TEXT,
    file_size TEXT
  );

  CREATE TABLE IF NOT EXISTS travel_permits (
    id TEXT PRIMARY KEY,
    entry_id TEXT UNIQUE NOT NULL,
    permit_code TEXT UNIQUE NOT NULL,
    qr_payload TEXT NOT NULL,
    passenger_name TEXT NOT NULL,
    destination TEXT NOT NULL,
    purpose TEXT NOT NULL,
    issue_date TEXT NOT NULL,
    expiry_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    FOREIGN KEY (entry_id) REFERENCES entries(id)
  );

  CREATE TABLE IF NOT EXISTS trips (
    id TEXT PRIMARY KEY,
    entry_id TEXT,
    vehicle_reg TEXT NOT NULL,
    driver_name TEXT,
    driver_id TEXT,
    origin_city TEXT NOT NULL,
    destination_city TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    passenger_count INTEGER DEFAULT 0,
    departed_at TEXT,
    arrived_at TEXT,
    gps_json TEXT,
    eta TEXT,
    notified_dest INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS system_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    system_logo TEXT
  );

  CREATE TABLE IF NOT EXISTS broadcasts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    target_role TEXT,
    target_city TEXT,
    sent_by TEXT NOT NULL,
    sent_by_name TEXT,
    sent_at TEXT NOT NULL
  );
`);

const settings = db.prepare("SELECT id FROM system_settings WHERE id = 1").get();
if (!settings) {
  db.prepare("INSERT INTO system_settings (id, system_logo) VALUES (1, ?)").run(
    "https://upload.wikimedia.org/wikipedia/commons/4/4c/Flag_of_Puntland.svg"
  );
}

export function logAudit(entryId, actorName, role, action, comments) {
  db.prepare(
    `INSERT INTO audit_log (entry_id, timestamp, actor_name, role, action, comments)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(entryId, new Date().toISOString(), actorName, role, action, comments || null);
}

export function getAuditHistory(entryId) {
  return db
    .prepare("SELECT * FROM audit_log WHERE entry_id = ? ORDER BY id ASC")
    .all(entryId)
    .map((r) => ({
      timestamp: r.timestamp,
      actorName: r.actor_name,
      role: r.role,
      action: r.action,
      comments: r.comments,
    }));
}

export function addNotification(userId, message, actionUrl, channel = "in_app") {
  const id = `n_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  db.prepare(
    `INSERT INTO notifications (id, user_id, message, date, read, action_url, channel)
     VALUES (?, ?, ?, ?, 0, ?, ?)`
  ).run(id, userId || null, message, new Date().toISOString(), actionUrl || null, channel);
  return id;
}
