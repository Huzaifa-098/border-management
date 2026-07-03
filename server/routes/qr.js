import { Router } from "express";
import { db } from "../db.js";
import { requireAuth } from "../auth.js";
import { parseJson, checkBlacklist } from "../utils.js";

const router = Router();

function buildSecurityAlert(names) {
  const hit = checkBlacklist(names, db);
  if (!hit) return null;
  return { type: "BLACKLIST", reason: hit.reason, name: hit.full_name };
}

function permitResponse(permit, entry, auth) {
  const expired = new Date(permit.expiry_date) < new Date();
  const valid = permit.status === "ACTIVE" && !expired && entry?.status === "APPROVED";
  const securityAlert = buildSecurityAlert([permit.passenger_name, entry?.full_name]);
  return {
    valid: valid && !securityAlert,
    permit: {
      permitCode: permit.permit_code,
      passengerName: permit.passenger_name,
      destination: permit.destination,
      purpose: permit.purpose,
      issueDate: permit.issue_date,
      expiryDate: permit.expiry_date,
      expired,
      status: permit.status,
    },
    entry: entry
      ? { id: entry.id, status: entry.status, originCity: entry.origin_city, destinationCity: entry.destination_city }
      : null,
    securityAlert,
    verifiedAt: new Date().toISOString(),
    verifiedBy: auth?.name,
  };
}

router.get("/verify/:code", requireAuth, (req, res) => {
  const permit = db.prepare("SELECT * FROM travel_permits WHERE permit_code = ?").get(req.params.code);
  if (!permit) return res.status(404).json({ valid: false, error: "Permit not found." });
  const entry = db.prepare("SELECT * FROM entries WHERE id = ?").get(permit.entry_id);
  res.json(permitResponse(permit, entry, req.auth));
});

router.get("/driver/:entryId", requireAuth, (req, res) => {
  const entry = db.prepare("SELECT * FROM entries WHERE id = ?").get(req.params.entryId);
  if (!entry) return res.status(404).json({ error: "Entry not found." });
  const vehicle = parseJson(entry.vehicle_json, {});
  const securityAlert = buildSecurityAlert([entry.full_name]);
  const trips = db.prepare("SELECT id, status, origin_city, destination_city FROM trips WHERE entry_id = ? ORDER BY created_at DESC LIMIT 5").all(entry.id);
  res.json({
    valid: entry.status === "APPROVED" && !securityAlert,
    driver: {
      fullName: entry.full_name,
      contactNumber: entry.contact_number,
      driverLicenseNumber: entry.driver_license,
      status: entry.status,
    },
    vehicle,
    originCity: entry.origin_city,
    destinationCity: entry.destination_city,
    status: entry.status,
    tripStatus: entry.trip_status,
    entryType: entry.entry_type,
    trips,
    securityAlert,
    verifiedAt: new Date().toISOString(),
    verifiedBy: req.auth.name,
  });
});

router.post("/verify", requireAuth, (req, res) => {
  const { payload } = req.body;
  if (!payload) return res.status(400).json({ error: "QR payload required." });

  let data;
  try {
    data = typeof payload === "string" ? JSON.parse(payload) : payload;
  } catch {
    return res.status(400).json({ error: "Invalid QR payload." });
  }

  const permit = db
    .prepare("SELECT * FROM travel_permits WHERE permit_code = ? OR qr_payload = ?")
    .get(data.code, typeof payload === "string" ? payload : JSON.stringify(data));
  if (!permit) return res.status(404).json({ valid: false, error: "Permit not found." });

  const entry = db.prepare("SELECT * FROM entries WHERE id = ?").get(permit.entry_id);
  res.json(permitResponse(permit, entry, req.auth));
});

export default router;
