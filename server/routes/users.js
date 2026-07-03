import { Router } from "express";
import { db } from "../db.js";
import { hashPassword, requireAuth, requireRoles } from "../auth.js";
import { rowToUser, rowToAdmin } from "../utils.js";
import { addNotification } from "../db.js";
import { parsePagination, buildPagination, searchClause } from "../pagination.js";

const router = Router();

router.get("/admins", requireAuth, requireRoles("SUPER_ADMIN", "CITY_ADMIN"), (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  let baseSql;
  let params = [];
  if (req.auth.role === "SUPER_ADMIN") {
    baseSql = "SELECT * FROM users WHERE role IN ('SUPER_ADMIN','CITY_ADMIN')";
  } else {
    baseSql = "SELECT * FROM users WHERE role = 'CITY_ADMIN' AND city = ?";
    params = [req.auth.city];
  }
  const search = searchClause(["full_name", "email", "city", "phone"], req.query.search);
  const sql = baseSql + search.sql;
  const allParams = [...params, ...search.params];
  const total = db.prepare(sql.replace("SELECT *", "SELECT COUNT(*) as c")).get(...allParams)?.c || 0;
  const rows = db.prepare(`${sql} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...allParams, limit, offset);
  res.json({ admins: rows.map(rowToAdmin), pagination: buildPagination(total, page, limit) });
});

router.post("/admins", requireAuth, requireRoles("SUPER_ADMIN"), (req, res) => {
  const { name, email, password, phone, responsibility, assignedCity, role } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: "Name, email and password required." });
  const exists = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (exists) return res.status(409).json({ error: "Email already exists." });

  const id = `a_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();
  const adminRole = role || "CITY_ADMIN";
  db.prepare(
    `INSERT INTO users (id, email, password_hash, full_name, phone, city, role, responsibility, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)`
  ).run(id, email, hashPassword(password), name, phone || "", assignedCity || "", adminRole, responsibility || "", now);

  res.status(201).json({ admin: rowToAdmin(db.prepare("SELECT * FROM users WHERE id = ?").get(id)) });
});

router.patch("/admins/:id", requireAuth, requireRoles("SUPER_ADMIN"), (req, res) => {
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
  if (!row || !["SUPER_ADMIN", "CITY_ADMIN"].includes(row.role)) {
    return res.status(404).json({ error: "Admin not found." });
  }
  const { name, email, phone, responsibility, assignedCity, status, password } = req.body;
  db.prepare(
    `UPDATE users SET full_name = COALESCE(?, full_name), email = COALESCE(?, email), phone = COALESCE(?, phone),
     city = COALESCE(?, city), responsibility = COALESCE(?, responsibility), status = COALESCE(?, status),
     password_hash = COALESCE(?, password_hash) WHERE id = ?`
  ).run(
    name || null,
    email || null,
    phone || null,
    assignedCity || null,
    responsibility || null,
    status || null,
    password ? hashPassword(password) : null,
    req.params.id
  );
  res.json({ admin: rowToAdmin(db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id)) });
});

router.delete("/admins/:id", requireAuth, requireRoles("SUPER_ADMIN"), (req, res) => {
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
  if (!row || row.role === "SUPER_ADMIN") return res.status(403).json({ error: "Cannot delete this admin." });
  db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

router.get("/", requireAuth, (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  let baseSql;
  let params = [];
  if (req.auth.role === "SUPER_ADMIN") {
    baseSql = "SELECT * FROM users WHERE role IN ('USER','BORDER_OFFICER')";
  } else if (req.auth.role === "CITY_ADMIN") {
    baseSql = "SELECT * FROM users WHERE created_by = ? AND role IN ('USER','BORDER_OFFICER')";
    params = [req.auth.sub];
  } else {
    baseSql = "SELECT * FROM users WHERE id = ?";
    params = [req.auth.sub];
  }
  const search = searchClause(["full_name", "email", "city", "phone"], req.query.search);
  const sql = baseSql + search.sql;
  const allParams = [...params, ...search.params];
  const total = db.prepare(sql.replace("SELECT *", "SELECT COUNT(*) as c")).get(...allParams)?.c || 0;
  const rows = db.prepare(`${sql} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...allParams, limit, offset);
  res.json({ users: rows.map(rowToUser), pagination: buildPagination(total, page, limit) });
});

router.post("/", requireAuth, requireRoles("CITY_ADMIN", "SUPER_ADMIN"), (req, res) => {
  const { fullName, email, password, phone, city, role, responsibility } = req.body;
  if (!email || !password || !fullName) return res.status(400).json({ error: "Missing required fields." });

  const allowedRoles = req.auth.role === "SUPER_ADMIN" ? ["USER", "BORDER_OFFICER", "CITY_ADMIN"] : ["USER", "BORDER_OFFICER"];
  const userRole = role || "USER";
  if (!allowedRoles.includes(userRole)) return res.status(400).json({ error: "Invalid role for your permission level." });

  const exists = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (exists) return res.status(409).json({ error: "Email already exists." });

  const id = `u_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();
  const assignCity = userRole === "CITY_ADMIN" ? city : req.auth.city || city;

  db.prepare(
    `INSERT INTO users (id, email, password_hash, full_name, phone, city, role, responsibility, status, created_by, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?)`
  ).run(id, email, hashPassword(password), fullName, phone || "", assignCity || "", userRole, responsibility || "", req.auth.sub, now);

  addNotification(id, `Account created by ${req.auth.name}.`, null, "in_app");
  res.status(201).json({ user: rowToUser(db.prepare("SELECT * FROM users WHERE id = ?").get(id)) });
});

router.patch("/:id", requireAuth, requireRoles("CITY_ADMIN", "SUPER_ADMIN"), (req, res) => {
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "User not found." });
  if (req.auth.role === "CITY_ADMIN" && row.created_by !== req.auth.sub) {
    return res.status(403).json({ error: "Not your user." });
  }

  const { fullName, phone, city, responsibility, status, password } = req.body;
  db.prepare(
    `UPDATE users SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone),
     city = COALESCE(?, city), responsibility = COALESCE(?, responsibility),
     status = COALESCE(?, status), password_hash = COALESCE(?, password_hash)
     WHERE id = ?`
  ).run(
    fullName || null,
    phone || null,
    city || null,
    responsibility || null,
    status || null,
    password ? hashPassword(password) : null,
    req.params.id
  );

  res.json({ user: rowToUser(db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id)) });
});

router.delete("/:id", requireAuth, requireRoles("CITY_ADMIN", "SUPER_ADMIN"), (req, res) => {
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "User not found." });
  if (req.auth.role === "CITY_ADMIN" && row.created_by !== req.auth.sub) {
    return res.status(403).json({ error: "Not your user." });
  }
  db.prepare("DELETE FROM entries WHERE user_id = ?").run(req.params.id);
  db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

export default router;
