import { Router } from "express";
import { db } from "../db.js";
import { requireAuth } from "../auth.js";
import { parseJson } from "../utils.js";

const router = Router();

function gpsScope(auth) {
  if (auth.role === "SUPER_ADMIN") return { sql: "", params: [] };
  if (auth.role === "CITY_ADMIN") {
    return {
      sql: " AND (e.assigned_city = ? OR e.origin_city = ? OR e.destination_city = ?)",
      params: [auth.city, auth.city, auth.city],
    };
  }
  if (auth.role === "BORDER_OFFICER") {
    return { sql: " AND e.created_by_officer_id = ?", params: [auth.sub] };
  }
  return { sql: " AND e.user_id = ?", params: [auth.sub] };
}

router.get("/active", requireAuth, (req, res) => {
  const scope = gpsScope(req.auth);
  const rows = db
    .prepare(
      `SELECT e.*, t.id as trip_id, t.gps_json as trip_gps FROM entries e
       LEFT JOIN trips t ON t.entry_id = e.id
       WHERE e.status = 'APPROVED' AND e.entry_type = 'DRIVER'${scope.sql}`
    )
    .all(...scope.params);

  res.json({
    vehicles: rows.map((r) => ({
      entryId: r.id,
      tripId: r.trip_id,
      fullName: r.full_name,
      vehicle: parseJson(r.vehicle_json),
      originCity: r.origin_city,
      destinationCity: r.destination_city,
      tripStatus: r.trip_status,
      gps: parseJson(r.trip_gps) || parseJson(r.gps_json) || {
        latitude: 8.4,
        longitude: 48.48,
        speed: 0,
        heading: 0,
        lastUpdated: new Date().toISOString(),
        status: "IDLE",
      },
    })),
  });
});

export default router;
