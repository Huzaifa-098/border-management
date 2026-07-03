import { Router } from "express";
import { db } from "../db.js";
import { requireAuth, requireRoles } from "../auth.js";
import { parseJson, scopeTripsQuery } from "../utils.js";
import { parsePagination, buildPagination } from "../pagination.js";

const router = Router();

router.get("/", requireAuth, (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const scope = scopeTripsQuery(req.auth);
  let baseSql = `SELECT * FROM trips WHERE 1=1${scope.sql}`;
  const params = [...scope.params];
  if (req.query.status) {
    baseSql += " AND status = ?";
    params.push(String(req.query.status));
  }
  const total = db.prepare(baseSql.replace("SELECT *", "SELECT COUNT(*) as c")).get(...params)?.c || 0;
  const rows = db.prepare(`${baseSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, limit, offset);
  res.json({
    trips: rows.map((r) => {
      const entry = r.entry_id ? db.prepare("SELECT passengers_json FROM entries WHERE id = ?").get(r.entry_id) : null;
      const passengers = parseJson(entry?.passengers_json, []);
      return {
        id: r.id,
        entryId: r.entry_id,
        vehicleReg: r.vehicle_reg,
        driverName: r.driver_name,
        originCity: r.origin_city,
        destinationCity: r.destination_city,
        status: r.status,
        passengerCount: Array.isArray(passengers) ? passengers.length : 0,
        gps: parseJson(r.gps_json),
        createdAt: r.created_at,
      };
    }),
    pagination: buildPagination(total, page, limit),
  });
});

router.get("/active", requireAuth, (req, res) => {
  const scope = scopeTripsQuery(req.auth);
  const rows = db
    .prepare(`SELECT * FROM trips WHERE status = 'IN_TRANSIT'${scope.sql}`)
    .all(...scope.params);
  res.json({ trips: rows });
});

router.patch("/:id/status", requireAuth, requireRoles("SUPER_ADMIN", "CITY_ADMIN"), (req, res) => {
  const { status, gps } = req.body;
  const valid = ["APPROVED", "IN_TRANSIT", "ARRIVED", "COMPLETED", "CANCELLED"];
  if (!valid.includes(status)) return res.status(400).json({ error: "Invalid status." });

  const updates = { status };
  if (gps) {
    db.prepare("UPDATE trips SET status = ?, gps_json = ? WHERE id = ?").run(status, JSON.stringify(gps), req.params.id);
    const trip = db.prepare("SELECT entry_id FROM trips WHERE id = ?").get(req.params.id);
    if (trip?.entry_id) {
      db.prepare("UPDATE entries SET trip_status = ?, gps_json = ? WHERE id = ?").run(status, JSON.stringify(gps), trip.entry_id);
    }
  } else {
    db.prepare("UPDATE trips SET status = ? WHERE id = ?").run(status, req.params.id);
    const trip = db.prepare("SELECT entry_id FROM trips WHERE id = ?").get(req.params.id);
    if (trip?.entry_id) db.prepare("UPDATE entries SET trip_status = ? WHERE id = ?").run(status, trip.entry_id);
  }

  const row = db.prepare("SELECT * FROM trips WHERE id = ?").get(req.params.id);
  res.json({
    trip: {
      id: row.id,
      entryId: row.entry_id,
      vehicleReg: row.vehicle_reg,
      driverName: row.driver_name,
      originCity: row.origin_city,
      destinationCity: row.destination_city,
      status: row.status,
      gps: parseJson(row.gps_json),
    },
  });
});

router.patch("/:id/gps", requireAuth, (req, res) => {
  const { latitude, longitude, speed, heading, status } = req.body;
  const gps = {
    latitude: latitude ?? 8.4,
    longitude: longitude ?? 48.48,
    speed: speed ?? 0,
    heading: heading ?? 0,
    lastUpdated: new Date().toISOString(),
    status: status || "MOVING",
    batteryLevel: 85,
    signalStrength: "GOOD",
  };
  db.prepare("UPDATE trips SET gps_json = ?, status = ? WHERE id = ?").run(JSON.stringify(gps), status || "IN_TRANSIT", req.params.id);

  const trip = db.prepare("SELECT entry_id FROM trips WHERE id = ?").get(req.params.id);
  if (trip?.entry_id) {
    db.prepare("UPDATE entries SET gps_json = ? WHERE id = ?").run(JSON.stringify(gps), trip.entry_id);
  }
  res.json({ gps });
});

export default router;
