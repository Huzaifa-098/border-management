import { Router } from "express";
import { db, addNotification } from "../db.js";
import { requireAuth, requireRoles } from "../auth.js";

const router = Router();

router.get("/", requireAuth, requireRoles("SUPER_ADMIN", "CITY_ADMIN"), (req, res) => {
  const rows = db.prepare("SELECT * FROM broadcasts ORDER BY sent_at DESC LIMIT 50").all();
  res.json({
    broadcasts: rows.map((r) => ({
      id: r.id,
      title: r.title,
      message: r.message,
      targetRole: r.target_role,
      targetCity: r.target_city,
      sentAt: r.sent_at,
      sentByName: r.sent_by_name,
    })),
  });
});

router.post("/", requireAuth, requireRoles("SUPER_ADMIN", "CITY_ADMIN"), (req, res) => {
  const { title, message, targetRole, targetCity } = req.body;
  if (!title || !message) return res.status(400).json({ error: "Title and message required." });

  const id = `bc_${Date.now()}`;
  db.prepare(
    `INSERT INTO broadcasts (id, title, message, target_role, target_city, sent_by, sent_by_name, sent_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, title, message, targetRole || null, targetCity || req.auth.city || null, req.auth.sub, req.auth.name, new Date().toISOString());

  const users = db.prepare("SELECT id, role, city FROM users WHERE status = 'ACTIVE'").all();
  for (const u of users) {
    if (targetRole && u.role !== targetRole) continue;
    if (targetCity && u.city !== targetCity) continue;
    addNotification(u.id, `📢 ${title}: ${message}`, null, "broadcast");
  }

  res.status(201).json({ id });
});

export default router;
