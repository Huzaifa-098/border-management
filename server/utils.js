export function parseJson(val, fallback = null) {
  if (!val) return fallback;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

export function rowToEntry(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    fullName: row.full_name,
    contactNumber: row.contact_number,
    photoUrl: row.photo_url || "",
    maritalStatus: row.marital_status,
    age: row.age,
    placeOfBirth: row.place_of_birth,
    guarantor: parseJson(row.guarantor_json),
    vehicle: parseJson(row.vehicle_json, { type: "", registrationNumber: "" }),
    vehicleModel: row.vehicle_model,
    vehicleOwner: row.vehicle_owner,
    vehicleOwnership: row.vehicle_ownership,
    cargoType: row.cargo_type,
    driverLicenseNumber: row.driver_license_number,
    gps: parseJson(row.gps_json),
    originCity: row.origin_city,
    destinationCity: row.destination_city,
    purpose: row.purpose,
    journeyDate: row.journey_date,
    issueDate: row.issue_date,
    expiryDate: row.expiry_date,
    officialRole: row.official_role,
    department: row.department,
    badgeNumber: row.badge_number,
    securityClearance: row.security_clearance,
    accompanyingPersons: row.accompanying_persons || "",
    passengers: parseJson(row.passengers_json, []),
    status: row.status,
    entryType: row.entry_type,
    adminComments: row.admin_comments,
    submittedAt: row.submitted_at,
    updatedAt: row.updated_at,
    createdByOfficerId: row.created_by_officer_id,
    assignedCity: row.assigned_city,
    permitId: row.permit_id,
    qrCode: row.qr_code,
    biometricFingerprint: row.biometric_fingerprint,
    biometricFace: row.biometric_face,
    tripStatus: row.trip_status,
  };
}

export function rowToUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    city: row.city,
    role: row.role,
    responsibility: row.responsibility,
    status: row.status,
    photoUrl: row.photo_url,
    createdByAdminId: row.created_by,
    preferences: parseJson(row.preferences_json, {
      emailAlerts: true,
      dailySummary: false,
      theme: "LIGHT",
    }),
    createdAt: row.created_at,
    failedAttempts: row.failed_attempts,
    isTransferred: !!row.is_transferred,
  };
}

export function rowToAdmin(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.full_name,
    email: row.email,
    phone: row.phone,
    photoUrl: row.photo_url,
    responsibility: row.responsibility,
    role: row.role,
    assignedCity: row.city || undefined,
    preferences: parseJson(row.preferences_json, {
      emailAlerts: true,
      dailySummary: true,
      theme: "LIGHT",
    }),
    status: row.status,
  };
}

export function generatePermitCode() {
  return `BMS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export function generateQrPayload(type, id, code) {
  return JSON.stringify({ type, id, code, ts: Date.now() });
}

export function checkBlacklist(names, db) {
  const blacklist = db.prepare("SELECT * FROM blacklist").all();
  let match = null;
  for (const name of names) {
    if (!name) continue;
    const hit = blacklist.find(
      (b) => b.full_name.trim().toLowerCase() === name.trim().toLowerCase()
    );
    if (hit) {
      db.prepare("UPDATE blacklist SET last_attempt_at = ? WHERE id = ?").run(
        new Date().toISOString(),
        hit.id
      );
      match = hit;
    }
  }
  return match;
}

export function scopeTripsQuery(auth) {
  if (auth.role === "SUPER_ADMIN") return { sql: "", params: [] };
  if (auth.role === "CITY_ADMIN") {
    return { sql: " AND (origin_city = ? OR destination_city = ?)", params: [auth.city, auth.city] };
  }
  if (auth.role === "BORDER_OFFICER") {
    return {
      sql: " AND entry_id IN (SELECT id FROM entries WHERE created_by_officer_id = ?)",
      params: [auth.sub],
    };
  }
  return {
    sql: " AND entry_id IN (SELECT id FROM entries WHERE user_id = ?)",
    params: [auth.sub],
  };
}

export function scopeEntriesQuery(auth) {
  if (auth.role === "SUPER_ADMIN") return { sql: "", params: [] };
  if (auth.role === "CITY_ADMIN") {
    return {
      sql: " AND (assigned_city = ? OR origin_city = ? OR destination_city = ?)",
      params: [auth.city, auth.city, auth.city],
    };
  }
  if (auth.role === "BORDER_OFFICER") {
    return { sql: " AND created_by_officer_id = ?", params: [auth.sub] };
  }
  return { sql: " AND user_id = ?", params: [auth.sub] };
}
