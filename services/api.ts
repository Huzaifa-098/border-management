import { startLoading, stopLoading, pushToast, parseApiError, parseApiSuccess } from "./feedbackStore";

const TOKEN_KEY = "pbms_token";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  city?: string;
  listType?: string;
  type?: string;
}

function q(params?: ListParams) {
  if (!params) return "";
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export const defaultPagination: PaginationMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
};

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T = unknown>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean; silent?: boolean } = {}
): Promise<T> {
  const method = (options.method || "GET").toUpperCase();
  const silent = options.silent === true;

  if (!silent) startLoading();
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const token = getToken();
    if (options.auth !== false && token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`/api${path}`, {
      method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = parseApiError(data, `Request failed (${res.status})`);
      if (!silent) pushToast("error", msg);
      const err = new Error(msg) as Error & { _pbmsHandled?: boolean };
      err._pbmsHandled = true;
      throw err;
    }

    const successMsg = parseApiSuccess(data, method);
    if (!silent && successMsg) pushToast("success", successMsg);

    return data as T;
  } catch (err) {
    if (!silent && err instanceof Error && !err._pbmsHandled) {
      pushToast("error", parseApiError(err));
    } else if (!silent && !(err instanceof Error)) {
      pushToast("error", parseApiError(err));
    }
    throw err;
  } finally {
    if (!silent) stopLoading();
  }
}

export const api = {
  health: () => request<{ status: string }>("/health"),
  getLogo: () => request<{ logo: string }>("/settings/logo", { auth: false }),

  login: (email: string, password: string) =>
    request<{ token: string; user: Record<string, unknown>; role: string }>("/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    }),
  me: () => request<{ user: Record<string, unknown>; role: string }>("/auth/me"),
  register: (email: string, password: string, responsibility: string) =>
    request("/users", {
      method: "POST",
      body: { email, password, responsibility, fullName: email.split("@")[0], role: "USER" },
    }),
  updateProfile: (data: Record<string, unknown>) =>
    request<{ user: Record<string, unknown> }>("/auth/profile", { method: "PATCH", body: data }),
  changePassword: (oldPassword: string, newPassword: string) =>
    request("/auth/change-password", { method: "POST", body: { oldPassword, newPassword } }),

  getEntries: (params?: ListParams) =>
    request<{ entries: unknown[]; pagination: PaginationMeta }>(`/entries${q(params)}`),
  getEntry: (id: string) => request<{ entry: unknown }>(`/entries/${id}`),
  addEntry: (entry: Record<string, unknown>) =>
    request<{ entry: unknown; watchlistWarning?: { fullName: string; reason: string } }>(
      "/entries",
      { method: "POST", body: entry }
    ),
  transferEntry: (id: string, city: string, comments?: string) =>
    request<{ entry: unknown }>(`/entries/${id}/transfer`, {
      method: "PATCH",
      body: { city, comments },
    }),
  editEntry: (id: string, data: Record<string, unknown>) =>
    request<{ entry: unknown }>(`/entries/${id}`, { method: "PATCH", body: data }),
  updateEntryStatus: (id: string, status: string, comments?: string) =>
    request<{ entry: unknown }>(`/entries/${id}/status`, {
      method: "PATCH",
      body: { status, comments },
    }),
  deleteEntry: (id: string) => request(`/entries/${id}`, { method: "DELETE" }),

  getUsers: (params?: ListParams) =>
    request<{ users: unknown[]; pagination: PaginationMeta }>(`/users${q(params)}`),
  getAdmins: (params?: ListParams) =>
    request<{ admins: unknown[]; pagination: PaginationMeta }>(`/users/admins${q(params)}`),
  createUser: (data: Record<string, unknown>) =>
    request("/users", { method: "POST", body: data }),
  updateUser: (id: string, data: Record<string, unknown>) => {
    const body = { ...data };
    if (body.passwordHash) {
      body.password = body.passwordHash;
      delete body.passwordHash;
    }
    return request<{ user: unknown }>(`/users/${id}`, { method: "PATCH", body });
  },
  deleteUser: (id: string) => request(`/users/${id}`, { method: "DELETE" }),

  addAdmin: (data: Record<string, unknown>) => {
    const body = {
      name: data.name,
      email: data.email,
      password: data.password || data.passwordHash,
      phone: data.phone,
      responsibility: data.responsibility,
      assignedCity: data.assignedCity,
      role: data.role || "CITY_ADMIN",
    };
    return request("/users/admins", { method: "POST", body });
  },
  updateAdmin: (id: string, data: Record<string, unknown>) => {
    const body: Record<string, unknown> = { ...data };
    if (body.passwordHash) {
      body.password = body.passwordHash;
      delete body.passwordHash;
    }
    if (body.name) body.name = body.name;
    return request(`/users/admins/${id}`, { method: "PATCH", body });
  },
  deleteAdmin: (id: string) => request(`/users/admins/${id}`, { method: "DELETE" }),

  getBlacklist: (params?: ListParams) =>
    request<{ blacklist: unknown[]; pagination: PaginationMeta }>(`/blacklist${q(params)}`),
  addBlacklist: (entry: Record<string, unknown>) =>
    request("/blacklist", { method: "POST", body: entry }),
  removeBlacklist: (id: string) => request(`/blacklist/${id}`, { method: "DELETE" }),

  getIncidents: (params?: ListParams) =>
    request<{ incidents: unknown[]; pagination: PaginationMeta }>(`/incidents${q(params)}`),
  addIncident: (data: Record<string, unknown>) =>
    request("/incidents", { method: "POST", body: data }),
  updateIncidentStatus: (id: string, status: string) =>
    request(`/incidents/${id}/status`, { method: "PATCH", body: { status } }),

  getEmergencies: () => request<{ alerts: unknown[] }>("/emergencies"),
  triggerEmergency: (data?: Record<string, unknown>) =>
    request("/emergencies", { method: "POST", body: data || { location: "Checkpoint", alertType: "PANIC" } }),
  resolveEmergency: (id: string) =>
    request(`/emergencies/${id}/resolve`, { method: "PATCH" }),

  getNotifications: () => request<{ notifications: unknown[] }>("/notifications"),
  markNotificationRead: (id: string) =>
    request(`/notifications/${id}/read`, { method: "PATCH" }),

  getMessages: () => request<{ messages: unknown[] }>("/messages"),
  sendMessage: (data: Record<string, unknown>) =>
    request("/messages", { method: "POST", body: data }),
  markMessagesRead: (partnerId: string) =>
    request("/messages/read", { method: "PATCH", body: { partnerId } }),

  getTrips: (params?: ListParams) =>
    request<{ trips: unknown[]; pagination: PaginationMeta }>(`/trips${q(params)}`),
  getActiveGps: () => request<{ vehicles: unknown[] }>("/gps/active"),
  updateTripStatus: (id: string, status: string, gps?: unknown) =>
    request(`/trips/${id}/status`, { method: "PATCH", body: { status, gps } }),
  updateTripGps: (id: string, gps: unknown) =>
    request(`/trips/${id}/gps`, { method: "PATCH", body: gps }),

  getPermitForEntry: (entryId: string) =>
    request<{ permit: unknown }>(`/permits/${entryId}`),
  verifyQr: (payload: string) =>
    request("/qr/verify", { method: "POST", body: { payload } }),
  verifyPermit: (code: string) =>
    request(`/qr/verify/${encodeURIComponent(code)}`),
  verifyDriver: (entryId: string) =>
    request(`/qr/driver/${entryId}`),

  getDashboard: () => request<{
    metrics: Record<string, number>;
    topCities: { city: string; count: number }[];
    travelTrends: { day: string; count: number }[];
  }>("/reports/dashboard"),
  getCities: () => request<{ cities: { id: string; name: string }[] }>("/cities"),

  getBroadcasts: () => request<{ broadcasts: unknown[] }>("/broadcasts"),
  sendBroadcast: (data: { title: string; message: string; targetRole?: string; targetCity?: string }) =>
    request("/broadcasts", { method: "POST", body: data }),
};
