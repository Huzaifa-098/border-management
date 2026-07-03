import { Router } from "express";
import { db } from "../db.js";
import { requireAuth, requireRoles } from "../auth.js";

const router = Router();

router.get("/dashboard", requireAuth, requireRoles("SUPER_ADMIN", "CITY_ADMIN"), (req, res) => {
  const cityFilter = req.auth.role === "CITY_ADMIN" ? req.auth.city : null;
  const entryWhere = cityFilter ? "WHERE assigned_city = ? OR origin_city = ?" : "";
  const params = cityFilter ? [cityFilter, cityFilter] : [];

  const totalEntries = db.prepare(`SELECT COUNT(*) as c FROM entries ${entryWhere}`).get(...params)?.c || 0;
  const pendingCity = db.prepare(`SELECT COUNT(*) as c FROM entries WHERE status = 'PENDING_CITY' ${cityFilter ? "AND (assigned_city = ? OR origin_city = ?)" : ""}`).get(...(cityFilter ? [cityFilter, cityFilter] : []))?.c || 0;
  const pendingSuper = db.prepare(`SELECT COUNT(*) as c FROM entries WHERE status = 'PENDING_SUPER' ${cityFilter ? "AND (assigned_city = ? OR origin_city = ?)" : ""}`).get(...(cityFilter ? [cityFilter, cityFilter] : []))?.c || 0;
  const approved = db.prepare(`SELECT COUNT(*) as c FROM entries WHERE status = 'APPROVED' ${cityFilter ? "AND (assigned_city = ? OR origin_city = ?)" : ""}`).get(...(cityFilter ? [cityFilter, cityFilter] : []))?.c || 0;
  const rejected = db.prepare(`SELECT COUNT(*) as c FROM entries WHERE status = 'REJECTED' ${cityFilter ? "AND (assigned_city = ? OR origin_city = ?)" : ""}`).get(...(cityFilter ? [cityFilter, cityFilter] : []))?.c || 0;
  const activeTrips = db.prepare("SELECT COUNT(*) as c FROM trips WHERE status = 'IN_TRANSIT'").get()?.c || 0;
  const tripsToday = db.prepare("SELECT COUNT(*) as c FROM entries WHERE date(submitted_at) = date('now')").get()?.c || 0;
  const blacklistCount = db.prepare("SELECT COUNT(*) as c FROM blacklist WHERE list_type = 'BLACKLIST'").get()?.c || 0;
  const usersCount = req.auth.role === "CITY_ADMIN"
    ? db.prepare("SELECT COUNT(*) as c FROM users WHERE created_by = ?").get(req.auth.sub)?.c || 0
    : db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'USER'").get()?.c || 0;

  const byCity = db.prepare("SELECT origin_city as city, COUNT(*) as count FROM entries GROUP BY origin_city ORDER BY count DESC LIMIT 10").all();

  res.json({
    metrics: {
      totalTravelers: usersCount,
      totalEntries,
      activeVehicles: activeTrips,
      tripsToday,
      pendingCity,
      pendingSuper,
      approved,
      rejected,
      blacklisted: blacklistCount,
      borderCrossings: approved,
    },
    topCities: byCity,
    travelTrends: db.prepare("SELECT date(submitted_at) as day, COUNT(*) as count FROM entries GROUP BY date(submitted_at) ORDER BY day DESC LIMIT 14").all(),
  });
});

router.get("/city/:city", requireAuth, requireRoles("SUPER_ADMIN", "CITY_ADMIN"), (req, res) => {
  const city = req.params.city;
  const entries = db.prepare("SELECT status, COUNT(*) as count FROM entries WHERE origin_city = ? OR destination_city = ? GROUP BY status").all(city, city);
  res.json({ city, breakdown: entries });
});

export default router;
