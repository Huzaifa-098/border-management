import { Router } from "express";
import { db } from "../db.js";
import { requireAuth } from "../auth.js";

const router = Router();

router.get("/", requireAuth, (req, res) => {
  const rows = db
    .prepare("SELECT * FROM notifications WHERE user_id = ? OR user_id IS NULL ORDER BY date DESC LIMIT 50")
    .all(req.auth.sub);
  res.json({
    notifications: rows.map((r) => ({
      id: r.id,
      message: r.message,
      date: r.date,
      read: !!r.read,
      actionUrl: r.action_url,
      channel: r.channel,
    })),
  });
});

router.patch("/:id/read", requireAuth, (req, res) => {
  db.prepare("UPDATE notifications SET read = 1 WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

export default router;
