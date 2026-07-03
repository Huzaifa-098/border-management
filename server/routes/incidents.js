import { Router } from "express";
import { db, addNotification } from "../db.js";
import { requireAuth, requireRoles } from "../auth.js";
import { parsePagination, buildPagination, searchClause } from "../pagination.js";

const router = Router();

function incidentsBaseQuery(auth) {
  if (auth.role === "BORDER_OFFICER" || auth.role === "USER") {
    return { sql: "SELECT * FROM incidents WHERE user_id = ?", params: [auth.sub] };
  }
  if (auth.role === "SUPER_ADMIN") {
    return { sql: "SELECT * FROM incidents WHERE 1=1", params: [] };
  }
  return {
    sql: `SELECT i.* FROM incidents i
          LEFT JOIN users u ON u.id = i.user_id
          WHERE u.created_by = ? OR i.location LIKE ?`,
    params: [auth.sub, `%${auth.city || ""}%`],
  };
}

router.get("/", requireAuth, (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const base = incidentsBaseQuery(req.auth);
  let sql = base.sql;
  const params = [...base.params];

  if (req.query.status && req.query.status !== "ALL") {
    sql += " AND status = ?";
    params.push(req.query.status);
  }
  if (req.query.type && req.query.type !== "ALL") {
    sql += " AND type = ?";
    params.push(req.query.type);
  }
  const search = searchClause(["description", "location", "reported_by", "type"], req.query.search);
  sql += search.sql;
  params.push(...search.params);

  const countSql = sql.includes(" i.") ? sql.replace("SELECT i.*", "SELECT COUNT(*) as c") : sql.replace("SELECT *", "SELECT COUNT(*) as c");
  const total = db.prepare(countSql).get(...params)?.c || 0;
  const orderSql = sql.includes(" i.") ? `${sql} ORDER BY i.timestamp DESC` : `${sql} ORDER BY timestamp DESC`;
  const rows = db.prepare(`${orderSql} LIMIT ? OFFSET ?`).all(...params, limit, offset);

  res.json({
    incidents: rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      reportedBy: r.reported_by,
      type: r.type,
      description: r.description,
      location: r.location,
      severity: r.severity,
      timestamp: r.timestamp,
      status: r.status,
      photoUrl: r.photo_url,
    })),
    pagination: buildPagination(total, page, limit),
  });
});

router.post("/", requireAuth, (req, res) => {
  const { type, description, location, severity, photoUrl } = req.body;
  if (!description || !location) return res.status(400).json({ error: "Description and location required." });
  const id = `inc_${Date.now()}`;
  db.prepare(
    `INSERT INTO incidents (id, user_id, reported_by, type, description, location, severity, timestamp, status, photo_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'REPORTED', ?)`
  ).run(id, req.auth.sub, req.auth.name, type || "Other", description, location, severity || "MEDIUM", new Date().toISOString(), photoUrl || null);

  addNotification(null, `New incident reported: ${type} at ${location}`, null, "security");
  res.status(201).json({ id });
});

router.patch("/:id/status", requireAuth, requireRoles("SUPER_ADMIN", "CITY_ADMIN"), (req, res) => {
  const { status } = req.body;
  const valid = ["REPORTED", "REVIEWING", "ESCALATED", "RESOLVED"];
  if (!valid.includes(status)) return res.status(400).json({ error: "Invalid status." });
  db.prepare("UPDATE incidents SET status = ? WHERE id = ?").run(status, req.params.id);
  if (status === "ESCALATED") addNotification(null, `Incident escalated to national command: ${req.params.id}`, null, "security");
  res.json({ success: true });
});

export default router;
