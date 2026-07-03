import { Router } from "express";
import { db, addNotification } from "../db.js";
import { requireAuth, requireRoles } from "../auth.js";

const router = Router();

router.get("/", requireAuth, requireRoles("SUPER_ADMIN", "CITY_ADMIN"), (req, res) => {
  const rows = db.prepare("SELECT * FROM emergency_alerts WHERE status = 'ACTIVE' ORDER BY timestamp DESC").all();
  res.json({
    alerts: rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      userName: r.user_name,
      userPhone: r.user_phone,
      location: r.location,
      alertType: r.alert_type,
      timestamp: r.timestamp,
      status: r.status,
    })),
  });
});

router.post("/", requireAuth, (req, res) => {
  const { location, alertType } = req.body;
  const id = `sos_${Date.now()}`;
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.auth.sub);
  db.prepare(
    `INSERT INTO emergency_alerts (id, user_id, user_name, user_phone, location, alert_type, timestamp, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`
  ).run(id, req.auth.sub, user?.full_name || req.auth.name, user?.phone || "", location || "Unknown", alertType || "PANIC", new Date().toISOString());

  addNotification(null, `🆘 EMERGENCY: ${user?.full_name} at ${location}`, null, "security");
  res.status(201).json({ id, message: "Emergency alert sent to authorities." });
});

router.patch("/:id/resolve", requireAuth, requireRoles("SUPER_ADMIN", "CITY_ADMIN"), (req, res) => {
  db.prepare("UPDATE emergency_alerts SET status = 'RESOLVED' WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

export default router;
