import { Router } from "express";
import { db } from "../db.js";
import { requireAuth, requireRoles } from "../auth.js";
import { parsePagination, buildPagination, searchClause } from "../pagination.js";

const router = Router();

router.get("/", requireAuth, requireRoles("SUPER_ADMIN", "CITY_ADMIN"), (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const { listType } = req.query;
  let sql = "SELECT * FROM blacklist WHERE 1=1";
  const params = [];
  if (listType && listType !== "ALL") {
    sql += " AND list_type = ?";
    params.push(listType);
  }
  const search = searchClause(["full_name", "passport_number", "phone_number", "reason"], req.query.search);
  sql += search.sql;
  params.push(...search.params);

  const total = db.prepare(sql.replace("SELECT *", "SELECT COUNT(*) as c")).get(...params)?.c || 0;
  const rows = db.prepare(`${sql} ORDER BY added_at DESC LIMIT ? OFFSET ?`).all(...params, limit, offset);
  res.json({
    blacklist: rows.map((r) => ({
      id: r.id,
      fullName: r.full_name,
      passportNumber: r.passport_number,
      nationality: r.nationality,
      reason: r.reason,
      addedBy: r.added_by,
      addedAt: r.added_at,
      photoUrl: r.photo_url,
      lastAttemptAt: r.last_attempt_at,
      phoneNumber: r.phone_number,
      age: r.age,
      maritalStatus: r.marital_status,
      listType: r.list_type,
    })),
    pagination: buildPagination(total, page, limit),
  });
});

router.post("/", requireAuth, requireRoles("SUPER_ADMIN"), (req, res) => {
  const { fullName, passportNumber, nationality, reason, photoUrl, phoneNumber, age, maritalStatus, listType } = req.body;
  if (!fullName || !reason) return res.status(400).json({ error: "Name and reason required." });
  const id = `bl_${Date.now()}`;
  db.prepare(
    `INSERT INTO blacklist (id, full_name, passport_number, nationality, reason, added_by, added_at, photo_url, phone_number, age, marital_status, list_type)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    fullName,
    passportNumber || "",
    nationality || "Somalia",
    reason,
    req.auth.name,
    new Date().toISOString(),
    photoUrl || null,
    phoneNumber || null,
    age || null,
    maritalStatus || null,
    listType || "BLACKLIST"
  );
  res.status(201).json({ id });
});

router.delete("/:id", requireAuth, requireRoles("SUPER_ADMIN"), (req, res) => {
  db.prepare("DELETE FROM blacklist WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

export default router;
