import { Router } from "express";
import { db } from "../db.js";
import { requireAuth } from "../auth.js";

const router = Router();

router.get("/:entryId", requireAuth, (req, res) => {
  const row = db.prepare("SELECT * FROM travel_permits WHERE entry_id = ?").get(req.params.entryId);
  if (!row) return res.status(404).json({ error: "Permit not found. Entry may not be approved yet." });
  res.json({
    permit: {
      id: row.id,
      entryId: row.entry_id,
      permitCode: row.permit_code,
      qrPayload: row.qr_payload,
      passengerName: row.passenger_name,
      destination: row.destination,
      purpose: row.purpose,
      issueDate: row.issue_date,
      expiryDate: row.expiry_date,
      status: row.status,
    },
  });
});

export default router;
