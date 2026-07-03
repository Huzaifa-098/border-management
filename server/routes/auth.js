import { Router } from "express";
import { db } from "../db.js";
import { hashPassword, verifyPassword, signToken, requireAuth, requireRoles } from "../auth.js";
import { rowToUser, rowToAdmin } from "../utils.js";

const router = Router();

function formatUser(row) {
  if (!row) return null;
  const base = rowToUser(row);
  if (["SUPER_ADMIN", "CITY_ADMIN", "BORDER_OFFICER"].includes(row.role)) {
    const a = rowToAdmin(row);
    return { ...a, fullName: a.name };
  }
  return base;
}

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required." });

  const row = db.prepare("SELECT * FROM users WHERE email = ? COLLATE NOCASE").get(email.trim());
  if (!row) return res.status(401).json({ error: "Invalid credentials." });
  if (row.status !== "ACTIVE") return res.status(403).json({ error: "Account inactive." });
  if (!verifyPassword(password, row.password_hash)) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  const user = formatUser(row);
  const token = signToken({
    sub: row.id,
    email: row.email,
    role: row.role,
    city: row.city,
    name: row.full_name,
  });

  res.json({ success: true, token, user, role: row.role });
});

router.get("/me", requireAuth, (req, res) => {
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(req.auth.sub);
  if (!row) return res.status(404).json({ error: "User not found." });
  res.json({ user: formatUser(row), role: row.role });
});

router.post("/register", requireAuth, requireRoles("CITY_ADMIN", "SUPER_ADMIN"), (req, res) => {
  const { email, password, fullName, responsibility, creatorId } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required." });
  const exists = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (exists) return res.status(409).json({ error: "Email already exists." });

  const id = `u_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO users (id, email, password_hash, full_name, phone, city, role, responsibility, status, created_by, created_at)
     VALUES (?, ?, ?, ?, '', '', 'USER', ?, 'ACTIVE', ?, ?)`
  ).run(id, email, hashPassword(password), fullName || email.split("@")[0], responsibility || "", creatorId || null, now);

  res.status(201).json({ user: rowToUser(db.prepare("SELECT * FROM users WHERE id = ?").get(id)) });
});

router.patch("/profile", requireAuth, (req, res) => {
  const { name, fullName, phone, photoUrl, responsibility, assignedCity, city } = req.body;
  const displayName = fullName || name;
  db.prepare(
    `UPDATE users SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone),
     photo_url = COALESCE(?, photo_url), responsibility = COALESCE(?, responsibility),
     city = COALESCE(?, city) WHERE id = ?`
  ).run(displayName || null, phone || null, photoUrl || null, responsibility || null, assignedCity || city || null, req.auth.sub);

  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(req.auth.sub);
  res.json({ user: formatUser(row) });
});

router.post("/change-password", requireAuth, (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) return res.status(400).json({ error: "Both passwords required." });
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(req.auth.sub);
  if (!verifyPassword(oldPassword, row.password_hash)) {
    return res.status(401).json({ error: "Current password is incorrect." });
  }
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hashPassword(newPassword), req.auth.sub);
  res.json({ success: true });
});

export default router;
