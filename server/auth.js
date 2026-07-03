import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "pbms-dev-secret-change-me";
if (!process.env.JWT_SECRET && process.env.NODE_ENV === "production") {
  console.error("FATAL: Set JWT_SECRET environment variable in production.");
  process.exit(1);
}

export function hashPassword(plain) {
  return bcrypt.hashSync(plain, 10);
}

export function verifyPassword(plain, hash) {
  return bcrypt.compareSync(plain, hash);
}

export function signToken(payload, expiresIn = "12h") {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function getBearerToken(req) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

export function requireAuth(req, res, next) {
  const token = getBearerToken(req);
  const payload = token && verifyToken(token);
  if (!payload) return res.status(401).json({ error: "Authentication required." });
  req.auth = payload;
  next();
}

export function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      return res.status(403).json({ error: "Insufficient permissions." });
    }
    next();
  };
}
