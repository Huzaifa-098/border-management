import express from "express";
import cors from "cors";

import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import entriesRouter from "./routes/entries.js";
import blacklistRouter from "./routes/blacklist.js";
import incidentsRouter from "./routes/incidents.js";
import emergenciesRouter from "./routes/emergencies.js";
import notificationsRouter from "./routes/notifications.js";
import messagesRouter from "./routes/messages.js";
import tripsRouter from "./routes/trips.js";
import permitsRouter from "./routes/permits.js";
import qrRouter from "./routes/qr.js";
import reportsRouter from "./routes/reports.js";
import broadcastsRouter from "./routes/broadcasts.js";
import gpsRouter from "./routes/gps.js";
import citiesRouter from "./routes/cities.js";
import { db } from "./db.js";

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (req, res) => res.json({ status: "ok", system: "PBMS" }));

app.get("/api/settings/logo", (req, res) => {
  const row = db.prepare("SELECT system_logo FROM system_settings WHERE id = 1").get();
  res.json({ logo: row?.system_logo });
});

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/entries", entriesRouter);
app.use("/api/blacklist", blacklistRouter);
app.use("/api/incidents", incidentsRouter);
app.use("/api/emergencies", emergenciesRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/trips", tripsRouter);
app.use("/api/permits", permitsRouter);
app.use("/api/qr", qrRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/broadcasts", broadcastsRouter);
app.use("/api/gps", gpsRouter);
app.use("/api/cities", citiesRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Server error." });
});

app.listen(PORT, () => {
  console.log(`PBMS backend running on http://localhost:${PORT}`);
});
