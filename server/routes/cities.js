import { Router } from "express";
import { db } from "../db.js";

const router = Router();

router.get("/", (req, res) => {
  const rows = db.prepare("SELECT id, name FROM cities ORDER BY name").all();
  res.json({ cities: rows });
});

export default router;
