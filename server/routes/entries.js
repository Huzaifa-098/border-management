import { Router } from "express";
import { db, logAudit, getAuditHistory, addNotification } from "../db.js";
import { requireAuth, requireRoles } from "../auth.js";
import {
  rowToEntry,
  scopeEntriesQuery,
  checkBlacklist,
  generatePermitCode,
  generateQrPayload,
} from "../utils.js";
import { parsePagination, buildPagination, searchClause } from "../pagination.js";

const router = Router();

function issuePermitAndTrip(entry) {
  const permitCode = generatePermitCode();
  const qrPayload = generateQrPayload("permit", entry.id, permitCode);
  const issueDate = new Date().toISOString().split("T")[0];
  const expiry = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];
  const permitId = `p_${entry.id}`;

  db.prepare(
    `INSERT OR REPLACE INTO travel_permits (id, entry_id, permit_code, qr_payload, passenger_name, destination, purpose, issue_date, expiry_date, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`
  ).run(permitId, entry.id, permitCode, qrPayload, entry.full_name, entry.destination_city, entry.purpose, issueDate, expiry);

  db.prepare("UPDATE entries SET permit_id = ?, qr_code = ?, trip_status = 'IN_TRANSIT', updated_at = ? WHERE id = ?").run(
    permitId,
    qrPayload,
    new Date().toISOString(),
    entry.id
  );

  if (entry.entry_type === "DRIVER") {
    const vehicle = JSON.parse(entry.vehicle_json || "{}");
    const tripId = `trip_${entry.id}`;
    db.prepare(
      `INSERT OR REPLACE INTO trips (id, entry_id, vehicle_reg, driver_name, driver_id, origin_city, destination_city, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'IN_TRANSIT', ?)`
    ).run(tripId, entry.id, vehicle.registrationNumber || "", entry.full_name, entry.user_id, entry.origin_city, entry.destination_city, new Date().toISOString());
  }

  addNotification(entry.user_id, `Travel permit ${permitCode} issued. Trip approved.`, null, "in_app");
  return { permitCode, qrPayload, permitId };
}

router.get("/", requireAuth, (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const scope = scopeEntriesQuery(req.auth);
  let sql = `SELECT * FROM entries WHERE 1=1${scope.sql}`;
  const params = [...scope.params];

  if (req.query.status && req.query.status !== "ALL") {
    sql += " AND status = ?";
    params.push(req.query.status);
  }
  if (req.query.city && req.query.city !== "ALL") {
    sql += " AND (assigned_city = ? OR origin_city = ? OR destination_city = ?)";
    params.push(req.query.city, req.query.city, req.query.city);
  }
  const search = searchClause(["full_name", "contact_number", "vehicle_json", "origin_city", "destination_city"], req.query.search);
  sql += search.sql;
  params.push(...search.params);

  const total = db.prepare(sql.replace("SELECT *", "SELECT COUNT(*) as c")).get(...params)?.c || 0;
  const rows = db.prepare(`${sql} ORDER BY submitted_at DESC LIMIT ? OFFSET ?`).all(...params, limit, offset);
  const entries = rows.map((r) => ({ ...rowToEntry(r), auditHistory: getAuditHistory(r.id) }));
  res.json({ entries, pagination: buildPagination(total, page, limit) });
});

router.get("/:id", requireAuth, (req, res) => {
  const row = db.prepare("SELECT * FROM entries WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Entry not found." });
  res.json({ entry: { ...rowToEntry(row), auditHistory: getAuditHistory(row.id) } });
});

router.post("/", requireAuth, requireRoles("USER", "BORDER_OFFICER"), (req, res) => {
  const data = req.body;
  const id = `e_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
  const now = new Date().toISOString();

  const names = [data.fullName, data.vehicle?.driverName].filter(Boolean);
  const blHit = checkBlacklist(names, db);
  if (blHit && blHit.list_type === "BLACKLIST") {
    addNotification(null, `BLACKLIST ALERT: ${blHit.full_name} attempted registration.`, null, "security");
    return res.status(403).json({ error: "BLACKLIST MATCH — travel blocked.", blacklist: blHit });
  }
  const watchlistHit = blHit && blHit.list_type === "WATCHLIST" ? blHit : null;
  if (watchlistHit) {
    addNotification(null, `WATCHLIST ALERT: ${watchlistHit.full_name} flagged for enhanced review.`, null, "security");
  }

  const userId = req.auth.role === "BORDER_OFFICER" ? data.userId || null : req.auth.sub;
  const assignedCity = data.assignedCity || req.auth.city || data.originCity;

  db.prepare(
    `INSERT INTO entries (
      id, user_id, full_name, contact_number, photo_url, marital_status, age, place_of_birth, guarantor_json,
      vehicle_json, vehicle_model, vehicle_owner, vehicle_ownership, cargo_type, driver_license_number,
      origin_city, destination_city, purpose, journey_date, accompanying_persons, passengers_json,
      status, entry_type, submitted_at, updated_at, created_by_officer_id, assigned_city,
      biometric_fingerprint, biometric_face, official_role, department, badge_number
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).run(
    id,
    userId,
    data.fullName,
    data.contactNumber || "",
    data.photoUrl || "",
    data.maritalStatus || null,
    data.age || null,
    data.placeOfBirth || null,
    data.guarantor ? JSON.stringify(data.guarantor) : null,
    JSON.stringify(data.vehicle || { type: "", registrationNumber: "" }),
    data.vehicleModel || null,
    data.vehicleOwner || null,
    data.vehicleOwnership || null,
    data.cargoType || null,
    data.driverLicenseNumber || null,
    data.originCity,
    data.destinationCity,
    data.purpose,
    data.journeyDate || null,
    data.accompanyingPersons || "None",
    data.passengers ? JSON.stringify(data.passengers) : null,
    "PENDING_CITY",
    data.entryType || "PASSENGER",
    now,
    now,
    req.auth.role === "BORDER_OFFICER" ? req.auth.sub : null,
    assignedCity,
    data.biometricFingerprint || null,
    data.biometricFace || null,
    data.officialRole || null,
    data.department || null,
    data.badgeNumber || null
  );

  logAudit(id, req.auth.name, req.auth.role, "Entry Submitted");
  if (userId) addNotification(userId, "Entry submitted — pending city review.", null, "in_app");
  const created = rowToEntry(db.prepare("SELECT * FROM entries WHERE id = ?").get(id));
  res.status(201).json({
    entry: created,
    watchlistWarning: watchlistHit
      ? { fullName: watchlistHit.full_name, reason: watchlistHit.reason, listType: "WATCHLIST" }
      : undefined,
  });
});

router.patch("/:id/status", requireAuth, requireRoles("CITY_ADMIN", "SUPER_ADMIN"), (req, res) => {
  const { status, comments } = req.body;
  const valid = ["PENDING_CITY", "PENDING_SUPER", "APPROVED", "REJECTED", "RETURNED"];
  if (!valid.includes(status)) return res.status(400).json({ error: "Invalid status." });

  const row = db.prepare("SELECT * FROM entries WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Entry not found." });

  if (req.auth.role === "CITY_ADMIN") {
    if (!["PENDING_SUPER", "RETURNED", "REJECTED"].includes(status) && status !== "PENDING_SUPER") {
      if (status === "APPROVED") return res.status(403).json({ error: "City admin cannot final-approve." });
    }
    if (row.status !== "PENDING_CITY" && row.status !== "RETURNED") {
      return res.status(400).json({ error: "Entry not in city review state." });
    }
    const next = status === "APPROVED" ? "PENDING_SUPER" : status;
    db.prepare("UPDATE entries SET status = ?, admin_comments = ?, updated_at = ? WHERE id = ?").run(
      next,
      comments || null,
      new Date().toISOString(),
      req.params.id
    );
    logAudit(req.params.id, req.auth.name, req.auth.role, `Status changed to ${next}`, comments);
    if (row.user_id) addNotification(row.user_id, `Entry status: ${next.replace("_", " ")}`, null, "in_app");
    return res.json({ entry: rowToEntry(db.prepare("SELECT * FROM entries WHERE id = ?").get(req.params.id)) });
  }

  // Super Admin
  if (status === "APPROVED") {
    db.prepare("UPDATE entries SET status = 'APPROVED', admin_comments = ?, updated_at = ? WHERE id = ?").run(
      comments || null,
      new Date().toISOString(),
      req.params.id
    );
    logAudit(req.params.id, req.auth.name, req.auth.role, "Status changed to APPROVED", comments);
    const updated = db.prepare("SELECT * FROM entries WHERE id = ?").get(req.params.id);
    const permit = issuePermitAndTrip(updated);
    if (row.user_id) addNotification(row.user_id, "Registration approved. Travel permit generated.", null, "sms");
    return res.json({ entry: rowToEntry(updated), permit });
  }

  db.prepare("UPDATE entries SET status = ?, admin_comments = ?, updated_at = ? WHERE id = ?").run(
    status,
    comments || null,
    new Date().toISOString(),
    req.params.id
  );
  logAudit(req.params.id, req.auth.name, req.auth.role, `Status changed to ${status}`, comments);
  if (row.user_id) addNotification(row.user_id, `Entry ${status.toLowerCase()}.`, null, "in_app");
  res.json({ entry: rowToEntry(db.prepare("SELECT * FROM entries WHERE id = ?").get(req.params.id)) });
});

router.patch("/:id", requireAuth, (req, res) => {
  const row = db.prepare("SELECT * FROM entries WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Entry not found." });
  if (req.auth.role === "USER" && row.user_id !== req.auth.sub) {
    return res.status(403).json({ error: "Not your entry." });
  }
  if (req.auth.role === "USER" && row.status !== "RETURNED") {
    return res.status(400).json({ error: "Entry can only be edited when returned for correction." });
  }
  const data = req.body;
  db.prepare(
    `UPDATE entries SET full_name = COALESCE(?, full_name), contact_number = COALESCE(?, contact_number),
     photo_url = COALESCE(?, photo_url), origin_city = COALESCE(?, origin_city),
     destination_city = COALESCE(?, destination_city), purpose = COALESCE(?, purpose),
     vehicle_json = COALESCE(?, vehicle_json), updated_at = ? WHERE id = ?`
  ).run(
    data.fullName || null,
    data.contactNumber || null,
    data.photoUrl || null,
    data.originCity || null,
    data.destinationCity || null,
    data.purpose || null,
    data.vehicle ? JSON.stringify(data.vehicle) : null,
    new Date().toISOString(),
    req.params.id
  );
  logAudit(req.params.id, req.auth.name, req.auth.role, "Entry updated");
  res.json({ entry: rowToEntry(db.prepare("SELECT * FROM entries WHERE id = ?").get(req.params.id)) });
});

router.patch("/:id/transfer", requireAuth, requireRoles("CITY_ADMIN", "SUPER_ADMIN"), (req, res) => {
  const { city, comments } = req.body;
  if (!city) return res.status(400).json({ error: "Target city required." });
  const row = db.prepare("SELECT * FROM entries WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Entry not found." });

  db.prepare(
    "UPDATE entries SET assigned_city = ?, origin_city = ?, updated_at = ? WHERE id = ?"
  ).run(city, city, new Date().toISOString(), req.params.id);

  logAudit(req.params.id, req.auth.name, req.auth.role, `Transferred jurisdiction to ${city}`, comments);
  if (row.user_id) addNotification(row.user_id, `Entry transferred to ${city} for review.`, null, "in_app");
  res.json({ entry: rowToEntry(db.prepare("SELECT * FROM entries WHERE id = ?").get(req.params.id)) });
});

router.delete("/:id", requireAuth, requireRoles("SUPER_ADMIN", "CITY_ADMIN", "USER"), (req, res) => {
  const row = db.prepare("SELECT * FROM entries WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Entry not found." });
  if (req.auth.role === "USER" && row.user_id !== req.auth.sub) {
    return res.status(403).json({ error: "Not your entry." });
  }
  db.prepare("DELETE FROM entries WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

router.post("/:id/biometric", requireAuth, (req, res) => {
  const { fingerprint, face } = req.body;
  db.prepare("UPDATE entries SET biometric_fingerprint = COALESCE(?, biometric_fingerprint), biometric_face = COALESCE(?, biometric_face), updated_at = ? WHERE id = ?").run(
    fingerprint || null,
    face || null,
    new Date().toISOString(),
    req.params.id
  );
  logAudit(req.params.id, req.auth.name, req.auth.role, "Biometric data captured");
  res.json({ success: true });
});

export default router;
