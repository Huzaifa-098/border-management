import { db, logAudit, addNotification } from "./db.js";
import { hashPassword } from "./auth.js";
import { generatePermitCode, generateQrPayload } from "./utils.js";

const CITIES = ["Garowe", "Bosaso", "Galkacyo", "Las Anod", "Qardho"];

for (const name of CITIES) {
  const id = `city_${name.toLowerCase().replace(/\s/g, "_")}`;
  db.prepare("INSERT OR IGNORE INTO cities (id, name) VALUES (?, ?)").run(id, name);
}

const accounts = [
  { id: "s1", email: "super@pbms.so", password: "super123", full_name: "Super Admin", role: "SUPER_ADMIN", city: "", responsibility: "National Security" },
  { id: "a1", email: "admin.garowe@pbms.so", password: "admin123", full_name: "City Admin Garowe", role: "CITY_ADMIN", city: "Garowe", responsibility: "Regional Oversight" },
  { id: "a2", email: "admin.bosaso@pbms.so", password: "admin123", full_name: "City Admin Bosaso", role: "CITY_ADMIN", city: "Bosaso", responsibility: "Port City Oversight" },
  { id: "a3", email: "admin.galkacyo@pbms.so", password: "admin123", full_name: "City Admin Galkacyo", role: "CITY_ADMIN", city: "Galkacyo", responsibility: "Central Region" },
  { id: "o1", email: "officer.garowe@pbms.so", password: "officer123", full_name: "Officer Hassan Ali", role: "BORDER_OFFICER", city: "Garowe", responsibility: "Border Checkpoint Officer" },
  { id: "o2", email: "officer.bosaso@pbms.so", password: "officer123", full_name: "Officer Fatima Noor", role: "BORDER_OFFICER", city: "Bosaso", responsibility: "Port Checkpoint" },
  { id: "u1", email: "ahmed@example.com", password: "password123", full_name: "Ahmed Ali", role: "USER", city: "Garowe", responsibility: "Truck Driver" },
  { id: "u2", email: "mohamed@example.com", password: "password123", full_name: "Mohamed Ibrahim", role: "USER", city: "Bosaso", responsibility: "Merchant" },
  { id: "u3", email: "amina@example.com", password: "password123", full_name: "Amina Yusuf", role: "USER", city: "Galkacyo", responsibility: "Student" },
  { id: "u4", email: "khalid@example.com", password: "password123", full_name: "Khalid Abdi", role: "USER", city: "Garowe", responsibility: "Bus Driver" },
  { id: "u5", email: "sahra@example.com", password: "password123", full_name: "Sahra Mohamed", role: "USER", city: "Las Anod", responsibility: "Healthcare Worker" },
];

function upsertUser(acc) {
  const exists = db.prepare("SELECT id FROM users WHERE email = ?").get(acc.email);
  if (exists) return;
  const createdBy = ["USER", "BORDER_OFFICER"].includes(acc.role)
    ? acc.city === "Bosaso"
      ? "a2"
      : acc.city === "Galkacyo"
        ? "a3"
        : "a1"
    : null;
  db.prepare(
    `INSERT INTO users (id, email, password_hash, full_name, phone, city, role, responsibility, status, created_at, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?)`
  ).run(
    acc.id,
    acc.email,
    hashPassword(acc.password),
    acc.full_name,
    `+252 90 ${Math.floor(1000000 + Math.random() * 9000000)}`,
    acc.city,
    acc.role,
    acc.responsibility,
    new Date().toISOString(),
    createdBy
  );
  console.log(`Created ${acc.role}: ${acc.email}`);
}

for (const acc of accounts) upsertUser(acc);

function upsertEntry(entry) {
  if (db.prepare("SELECT id FROM entries WHERE id = ?").get(entry.id)) return;

  db.prepare(
    `INSERT INTO entries (
      id, user_id, full_name, contact_number, photo_url, vehicle_json, origin_city, destination_city,
      purpose, status, entry_type, submitted_at, updated_at, assigned_city, accompanying_persons,
      created_by_officer_id, admin_comments, trip_status, gps_json, passengers_json
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).run(
    entry.id,
    entry.userId || null,
    entry.fullName,
    entry.contactNumber,
    entry.photoUrl || "",
    JSON.stringify(entry.vehicle),
    entry.originCity,
    entry.destinationCity,
    entry.purpose,
    entry.status,
    entry.entryType,
    entry.submittedAt,
    entry.updatedAt,
    entry.assignedCity,
    entry.accompanyingPersons || "None",
    entry.createdByOfficerId || null,
    entry.adminComments || null,
    entry.tripStatus || "PENDING",
    entry.gps ? JSON.stringify(entry.gps) : null,
    entry.passengers ? JSON.stringify(entry.passengers) : null
  );

  for (const log of entry.audit || []) {
    logAudit(entry.id, log.actor, log.role, log.action, log.comments);
  }

  if (entry.status === "APPROVED") {
    const permitCode = generatePermitCode();
    const qrPayload = generateQrPayload("TRAVEL_PERMIT", entry.id, permitCode);
    const issueDate = new Date().toISOString().split("T")[0];
    const expiry = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];
    const permitId = `p_${entry.id}`;
    db.prepare(
      `INSERT OR REPLACE INTO travel_permits (id, entry_id, permit_code, qr_payload, passenger_name, destination, purpose, issue_date, expiry_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`
    ).run(permitId, entry.id, permitCode, qrPayload, entry.fullName, entry.destinationCity, entry.purpose, issueDate, expiry);
    db.prepare("UPDATE entries SET permit_id = ?, qr_code = ?, trip_status = ? WHERE id = ?").run(
      permitId,
      qrPayload,
      entry.entryType === "DRIVER" ? "IN_TRANSIT" : "APPROVED",
      entry.id
    );

    if (entry.entryType === "DRIVER") {
      const tripId = `trip_${entry.id}`;
      db.prepare(
        `INSERT OR REPLACE INTO trips (id, entry_id, vehicle_reg, driver_name, driver_id, origin_city, destination_city, status, gps_json, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'IN_TRANSIT', ?, ?)`
      ).run(
        tripId,
        entry.id,
        entry.vehicle.registrationNumber,
        entry.fullName,
        entry.userId,
        entry.originCity,
        entry.destinationCity,
        JSON.stringify(entry.gps || { latitude: 8.41, longitude: 48.49, speed: 52, heading: 90, lastUpdated: new Date().toISOString(), status: "MOVING" }),
        entry.submittedAt
      );
    }
    if (entry.userId) addNotification(entry.userId, `Travel permit ${permitCode} issued.`, null, "sms");
  }

  console.log(`Entry: ${entry.id} (${entry.status})`);
}

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();

const demoEntries = [
  {
    id: "demo_e1",
    userId: "u1",
    fullName: "Ahmed Ali",
    contactNumber: "+252 90 1234567",
    vehicle: { type: "Toyota Land Cruiser", registrationNumber: "PL 1234 A" },
    originCity: "Garowe",
    destinationCity: "Bosaso",
    purpose: "Business Trade",
    status: "PENDING_CITY",
    entryType: "PASSENGER",
    submittedAt: daysAgo(1),
    updatedAt: daysAgo(1),
    assignedCity: "Garowe",
    audit: [{ actor: "Ahmed Ali", role: "USER", action: "Entry Submitted" }],
  },
  {
    id: "demo_e2",
    userId: "u2",
    fullName: "Mohamed Ibrahim",
    contactNumber: "+252 90 2345678",
    vehicle: { type: "Isuzu Truck", registrationNumber: "BS 7788" },
    originCity: "Bosaso",
    destinationCity: "Galkacyo",
    purpose: "Cargo Delivery",
    status: "PENDING_SUPER",
    entryType: "DRIVER",
    submittedAt: daysAgo(3),
    updatedAt: daysAgo(2),
    assignedCity: "Bosaso",
    adminComments: "Documents verified by city admin.",
    audit: [
      { actor: "Mohamed Ibrahim", role: "USER", action: "Entry Submitted" },
      { actor: "City Admin Bosaso", role: "CITY_ADMIN", action: "Status changed to PENDING_SUPER", comments: "Verified" },
    ],
  },
  {
    id: "demo_e3",
    userId: "u4",
    fullName: "Khalid Abdi",
    contactNumber: "+252 90 4567890",
    vehicle: { type: "Coaster Bus", registrationNumber: "PL 9900", driverName: "Khalid Abdi" },
    originCity: "Garowe",
    destinationCity: "Las Anod",
    purpose: "Passenger Transport",
    status: "APPROVED",
    entryType: "DRIVER",
    submittedAt: daysAgo(5),
    updatedAt: daysAgo(4),
    assignedCity: "Garowe",
    gps: { latitude: 8.42, longitude: 48.51, speed: 68, heading: 45, lastUpdated: new Date().toISOString(), status: "MOVING", batteryLevel: 88, signalStrength: "GOOD" },
    passengers: [{ fullName: "Hassan Omar", contactNumber: "+252 90 1112233", photoUrl: "" }],
    audit: [
      { actor: "Khalid Abdi", role: "USER", action: "Entry Submitted" },
      { actor: "City Admin Garowe", role: "CITY_ADMIN", action: "Forwarded to Super Admin" },
      { actor: "Super Admin", role: "SUPER_ADMIN", action: "Status changed to APPROVED", comments: "Authorized" },
    ],
  },
  {
    id: "demo_e4",
    userId: "u3",
    fullName: "Amina Yusuf",
    contactNumber: "+252 90 3456789",
    vehicle: { type: "Sedan", registrationNumber: "GK 3344" },
    originCity: "Galkacyo",
    destinationCity: "Garowe",
    purpose: "University Enrollment",
    status: "APPROVED",
    entryType: "PASSENGER",
    submittedAt: daysAgo(7),
    updatedAt: daysAgo(6),
    assignedCity: "Galkacyo",
    audit: [
      { actor: "Amina Yusuf", role: "USER", action: "Entry Submitted" },
      { actor: "Super Admin", role: "SUPER_ADMIN", action: "Status changed to APPROVED" },
    ],
  },
  {
    id: "demo_e5",
    userId: "u5",
    fullName: "Sahra Mohamed",
    contactNumber: "+252 90 5678901",
    vehicle: { type: "Ambulance", registrationNumber: "LA 2200" },
    originCity: "Las Anod",
    destinationCity: "Bosaso",
    purpose: "Medical Supplies",
    status: "REJECTED",
    entryType: "PASSENGER",
    submittedAt: daysAgo(2),
    updatedAt: daysAgo(1),
    assignedCity: "Las Anod",
    adminComments: "Incomplete medical authorization documents.",
    audit: [
      { actor: "Sahra Mohamed", role: "USER", action: "Entry Submitted" },
      { actor: "Super Admin", role: "SUPER_ADMIN", action: "Status changed to REJECTED", comments: "Missing docs" },
    ],
  },
  {
    id: "demo_e6",
    userId: "u1",
    fullName: "Ahmed Ali",
    contactNumber: "+252 90 1234567",
    vehicle: { type: "Pickup", registrationNumber: "PL 5566" },
    originCity: "Garowe",
    destinationCity: "Qardho",
    purpose: "Family Visit",
    status: "RETURNED",
    entryType: "PASSENGER",
    submittedAt: daysAgo(4),
    updatedAt: daysAgo(3),
    assignedCity: "Garowe",
    adminComments: "Please update guarantor information for minor accompanying passenger.",
    audit: [
      { actor: "Ahmed Ali", role: "USER", action: "Entry Submitted" },
      { actor: "City Admin Garowe", role: "CITY_ADMIN", action: "Status changed to RETURNED", comments: "Fix guarantor" },
    ],
  },
  {
    id: "demo_e7",
    fullName: "Officer Registered Passenger",
    contactNumber: "+252 90 1112223",
    vehicle: { type: "Bus", registrationNumber: "PL 5555" },
    originCity: "Garowe",
    destinationCity: "Bosaso",
    purpose: "Family Visit",
    status: "APPROVED",
    entryType: "PASSENGER",
    submittedAt: daysAgo(10),
    updatedAt: daysAgo(9),
    assignedCity: "Garowe",
    createdByOfficerId: "o1",
    audit: [
      { actor: "Officer Hassan Ali", role: "BORDER_OFFICER", action: "Entry Submitted" },
      { actor: "Super Admin", role: "SUPER_ADMIN", action: "Status changed to APPROVED" },
    ],
  },
  {
    id: "demo_e8",
    userId: "u2",
    fullName: "Mohamed Ibrahim",
    contactNumber: "+252 90 2345678",
    vehicle: { type: "Truck", registrationNumber: "BS 1122", driverName: "Mohamed Ibrahim" },
    originCity: "Bosaso",
    destinationCity: "Garowe",
    purpose: "Import Goods",
    status: "APPROVED",
    entryType: "DRIVER",
    submittedAt: daysAgo(2),
    updatedAt: daysAgo(1),
    assignedCity: "Bosaso",
    gps: { latitude: 8.38, longitude: 48.45, speed: 35, heading: 270, lastUpdated: new Date().toISOString(), status: "MOVING", batteryLevel: 72, signalStrength: "GOOD" },
    audit: [
      { actor: "Mohamed Ibrahim", role: "USER", action: "Entry Submitted" },
      { actor: "Super Admin", role: "SUPER_ADMIN", action: "Status changed to APPROVED" },
    ],
  },
];

for (const e of demoEntries) upsertEntry(e);

function upsertBlacklist(item) {
  if (db.prepare("SELECT id FROM blacklist WHERE id = ?").get(item.id)) return;
  db.prepare(
    `INSERT INTO blacklist (id, full_name, passport_number, nationality, reason, added_by, added_at, list_type, phone_number, last_attempt_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    item.id,
    item.fullName,
    item.passportNumber,
    item.nationality,
    item.reason,
    item.addedBy,
    item.addedAt,
    item.listType,
    item.phoneNumber || null,
    item.lastAttemptAt || null
  );
  console.log(`Blacklist: ${item.fullName} (${item.listType})`);
}

[
  { id: "bl_demo1", fullName: "Abdi Farah", passportNumber: "P00998877", nationality: "Somalia", reason: "Smuggling contraband attempted at Bosaso port.", addedBy: "Super Admin", addedAt: daysAgo(30), listType: "BLACKLIST", phoneNumber: "+252 90 9998877", lastAttemptAt: daysAgo(1) },
  { id: "bl_demo2", fullName: "Yusuf Jama", passportNumber: "P11223344", nationality: "Somalia", reason: "Document forgery — fake national ID detected.", addedBy: "Super Admin", addedAt: daysAgo(60), listType: "BLACKLIST" },
  { id: "bl_demo3", fullName: "Hodan Ali", passportNumber: "P55667788", nationality: "Somalia", reason: "Previously flagged for suspicious border crossing pattern.", addedBy: "Super Admin", addedAt: daysAgo(14), listType: "WATCHLIST", phoneNumber: "+252 90 5566778" },
  { id: "bl_demo4", fullName: "Omar Warsame", passportNumber: "P99887766", nationality: "Somalia", reason: "Associated with known smuggling network — monitor closely.", addedBy: "Super Admin", addedAt: daysAgo(7), listType: "WATCHLIST" },
].forEach(upsertBlacklist);

function upsertIncident(inc) {
  if (db.prepare("SELECT id FROM incidents WHERE id = ?").get(inc.id)) return;
  db.prepare(
    `INSERT INTO incidents (id, user_id, reported_by, type, description, location, severity, timestamp, status, photo_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(inc.id, inc.userId, inc.reportedBy, inc.type, inc.description, inc.location, inc.severity, inc.timestamp, inc.status, null);
  console.log(`Incident: ${inc.type} (${inc.status})`);
}

[
  { id: "inc_demo1", userId: "u1", reportedBy: "Ahmed Ali", type: "Suspicious Vehicle", description: "Unregistered vehicle observed near checkpoint with covered plates.", location: "Garowe North Checkpoint", severity: "HIGH", timestamp: daysAgo(0), status: "REPORTED" },
  { id: "inc_demo2", userId: "u2", reportedBy: "Mohamed Ibrahim", type: "Smuggling Activities", description: "Hidden compartment discovered during routine inspection.", location: "Bosaso Port Gate 3", severity: "CRITICAL", timestamp: daysAgo(2), status: "ESCALATED" },
  { id: "inc_demo3", userId: "u4", reportedBy: "Khalid Abdi", type: "Vehicle Breakdown", description: "Bus engine failure on Garowe–Las Anod highway.", location: "Highway KM 45, Garowe", severity: "MEDIUM", timestamp: daysAgo(1), status: "REVIEWING" },
  { id: "inc_demo4", userId: "u5", reportedBy: "Sahra Mohamed", type: "Medical Emergency", description: "Passenger requiring urgent medical attention at checkpoint.", location: "Las Anod Checkpoint", severity: "HIGH", timestamp: daysAgo(5), status: "RESOLVED" },
  { id: "inc_demo5", userId: "o1", reportedBy: "Officer Hassan Ali", type: "Document Forgery", description: "Travel permit QR code mismatch detected during scan.", location: "Garowe Central Checkpoint", severity: "HIGH", timestamp: daysAgo(3), status: "REPORTED" },
].forEach(upsertIncident);

function upsertEmergency(alert) {
  if (db.prepare("SELECT id FROM emergency_alerts WHERE id = ?").get(alert.id)) return;
  db.prepare(
    `INSERT INTO emergency_alerts (id, user_id, user_name, user_phone, location, alert_type, timestamp, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(alert.id, alert.userId, alert.userName, alert.userPhone, alert.location, alert.alertType, alert.timestamp, alert.status);
  console.log(`Emergency: ${alert.alertType} (${alert.status})`);
}

upsertEmergency({ id: "sos_demo1", userId: "u3", userName: "Amina Yusuf", userPhone: "+252 90 3456789", location: "Galkacyo Bus Terminal", alertType: "PANIC", timestamp: daysAgo(0), status: "ACTIVE" });
upsertEmergency({ id: "sos_demo2", userId: "u1", userName: "Ahmed Ali", userPhone: "+252 90 1234567", location: "Garowe Checkpoint B", alertType: "SECURITY", timestamp: daysAgo(3), status: "RESOLVED" });

function upsertMessage(msg) {
  if (db.prepare("SELECT id FROM messages WHERE id = ?").get(msg.id)) return;
  db.prepare(
    `INSERT INTO messages (id, sender_id, receiver_id, sender_name, sender_role, content, timestamp, read, type)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'text')`
  ).run(msg.id, msg.senderId, msg.receiverId, msg.senderName, msg.senderRole, msg.content, msg.timestamp, msg.read ? 1 : 0);
}

[
  { id: "m_demo1", senderId: "u1", receiverId: "ADMIN", senderName: "Ahmed Ali", senderRole: "USER", content: "Hello, when will my Garowe–Bosaso application be reviewed?", timestamp: daysAgo(0), read: false },
  { id: "m_demo2", senderId: "a1", receiverId: "u1", senderName: "City Admin Garowe", senderRole: "CITY_ADMIN", content: "Your application is under review. We will notify you within 24 hours.", timestamp: daysAgo(0), read: false },
  { id: "m_demo3", senderId: "o1", receiverId: "ADMIN", senderName: "Officer Hassan Ali", senderRole: "BORDER_OFFICER", content: "Checkpoint A reporting high traffic volume today.", timestamp: daysAgo(1), read: true },
  { id: "m_demo4", senderId: "s1", receiverId: "a1", senderName: "Super Admin", senderRole: "SUPER_ADMIN", content: "Please expedite pending super-admin approvals for Bosaso route.", timestamp: daysAgo(2), read: false },
].forEach(upsertMessage);

function upsertBroadcast(bc) {
  if (db.prepare("SELECT id FROM broadcasts WHERE id = ?").get(bc.id)) return;
  db.prepare(
    `INSERT INTO broadcasts (id, title, message, target_role, target_city, sent_by, sent_by_name, sent_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(bc.id, bc.title, bc.message, bc.targetRole || null, bc.targetCity || null, "s1", "Super Admin", bc.sentAt);
  console.log(`Broadcast: ${bc.title}`);
}

[
  { id: "bc_demo1", title: "Border Security Alert", message: "All checkpoints: increase vehicle inspection protocols effective immediately.", targetRole: "BORDER_OFFICER", sentAt: daysAgo(1) },
  { id: "bc_demo2", title: "System Maintenance", message: "PBMS will undergo scheduled maintenance Sunday 2AM–4AM.", targetRole: null, sentAt: daysAgo(3) },
  { id: "bc_demo3", title: "Garowe Traffic Advisory", message: "Expect delays on Garowe–Bosaso route due to road works.", targetCity: "Garowe", sentAt: daysAgo(0) },
].forEach(upsertBroadcast);

// Demo notifications
const notifExists = db.prepare("SELECT id FROM notifications WHERE id = 'n_demo1'").get();
if (!notifExists) {
  addNotification("u1", "Your entry Garowe → Bosaso is pending city review.", null, "in_app");
  addNotification("u2", "Entry approved! Travel permit issued.", null, "sms");
  addNotification(null, "🆘 EMERGENCY: Amina Yusuf at Galkacyo Bus Terminal", null, "security");
  addNotification("a1", "3 entries awaiting your review in Garowe.", null, "in_app");
  console.log("Demo notifications added.");
}

console.log("\n══════════════════════════════════════════");
console.log("PBMS seed complete — demo data loaded");
console.log("══════════════════════════════════════════");
console.log("\nLogins (all passwords as shown):");
console.log("  Super Admin:     super@pbms.so / super123");
console.log("  City Admin (GR): admin.garowe@pbms.so / admin123");
console.log("  City Admin (BS): admin.bosaso@pbms.so / admin123");
console.log("  City Admin (GK): admin.galkacyo@pbms.so / admin123");
console.log("  Border Officer:  officer.garowe@pbms.so / officer123");
console.log("  Border Officer:  officer.bosaso@pbms.so / officer123");
console.log("  Traveler:        ahmed@example.com / password123");
console.log("  Traveler:        mohamed@example.com / password123");
console.log("  Traveler:        amina@example.com / password123");
console.log("\nDemo data: 8 entries, 4 blacklist/watchlist, 5 incidents,");
console.log("           2 emergencies, 4 messages, 3 broadcasts, active trips");

// Ensure entry photos + system logo exist (patch existing DB)
const entryPhotos = {
  demo_e1: "https://picsum.photos/seed/pbms_ahmed/400/500",
  demo_e2: "https://picsum.photos/seed/pbms_mohamed/400/500",
  demo_e3: "https://picsum.photos/seed/pbms_khalid/400/500",
  demo_e4: "https://picsum.photos/seed/pbms_amina/400/500",
  demo_e5: "https://picsum.photos/seed/pbms_sahra/400/500",
  demo_e6: "https://picsum.photos/seed/pbms_ahmed2/400/500",
  demo_e7: "https://picsum.photos/seed/pbms_officer/400/500",
  demo_e8: "https://picsum.photos/seed/pbms_mohamed2/400/500",
};
for (const [id, url] of Object.entries(entryPhotos)) {
  db.prepare(
    "UPDATE entries SET photo_url = ? WHERE id = ? AND (photo_url IS NULL OR photo_url = '')"
  ).run(url, id);
}
db.prepare(
  "UPDATE system_settings SET system_logo = ? WHERE id = 1 AND (system_logo IS NULL OR system_logo = '')"
).run("https://upload.wikimedia.org/wikipedia/commons/4/4c/Flag_of_Puntland.svg");
console.log("Entry photos & logo patched.");
