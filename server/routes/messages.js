import { Router } from "express";
import { db } from "../db.js";
import { requireAuth } from "../auth.js";

const router = Router();

function getInbox(req) {
  return db
    .prepare(
      `SELECT * FROM messages WHERE receiver_id = ? OR sender_id = ? OR receiver_id = 'ADMIN' ORDER BY timestamp DESC LIMIT 100`
    )
    .all(req.auth.role === "USER" ? req.auth.sub : "ADMIN", req.auth.sub);
}

router.get("/", requireAuth, (req, res) => {
  const rows = getInbox(req);
  res.json({
    messages: rows.map((r) => ({
      id: r.id,
      senderId: r.sender_id,
      receiverId: r.receiver_id,
      senderName: r.sender_name,
      senderRole: r.sender_role,
      content: r.content,
      timestamp: r.timestamp,
      read: !!r.read,
      type: r.type,
    })),
  });
});

router.get("/inbox", requireAuth, (req, res) => {
  const rows = db
    .prepare(
      `SELECT * FROM messages WHERE receiver_id = ? OR receiver_id = 'ADMIN' ORDER BY timestamp DESC LIMIT 100`
    )
    .all(req.auth.role === "USER" ? req.auth.sub : "ADMIN");
  res.json({
    messages: rows.map((r) => ({
      id: r.id,
      senderId: r.sender_id,
      receiverId: r.receiver_id,
      senderName: r.sender_name,
      senderRole: r.sender_role,
      content: r.content,
      timestamp: r.timestamp,
      read: !!r.read,
      type: r.type,
    })),
  });
});

router.post("/", requireAuth, (req, res) => {
  const { receiverId, content, type } = req.body;
  if (!content) return res.status(400).json({ error: "Content required." });
  const id = `m_${Date.now()}`;
  db.prepare(
    `INSERT INTO messages (id, sender_id, receiver_id, sender_name, sender_role, content, timestamp, read, type)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`
  ).run(id, req.auth.sub, receiverId || "ADMIN", req.auth.name, req.auth.role, content, new Date().toISOString(), type || "text");
  res.status(201).json({ id });
});

router.patch("/read", requireAuth, (req, res) => {
  const { partnerId } = req.body;
  if (partnerId) {
    db.prepare("UPDATE messages SET read = 1 WHERE sender_id = ? AND receiver_id = ?").run(partnerId, req.auth.sub);
  }
  res.json({ success: true });
});

export default router;
