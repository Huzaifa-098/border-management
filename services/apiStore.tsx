import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import {
  UserEntry,
  EntryStatus,
  Role,
  AdminUser,
  Notification,
  RegisteredUser,
  StoreContextType,
  BlacklistEntry,
  HumanMessage,
  Incident,
  EmergencyAlert,
} from "../types";
import { api, getToken, setToken } from "./api";
import { resolveLogoUrl, DEFAULT_LOGO } from "../utils/entryPhoto";

function roleFromUser(user: Record<string, unknown> | null): Role {
  if (!user) return Role.USER;
  return (user.role as Role) || Role.USER;
}

const StoreContext = createContext<StoreContextType | null>(null);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<UserEntry[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [humanMessages, setHumanMessages] = useState<HumanMessage[]>([]);
  const [broadcasts, setBroadcasts] = useState<
    { id: string; title: string; message: string; sentAt: string; sentByName: string }[]
  >([]);
  const [currentRole, setCurrentRole] = useState<Role>(() => {
    const stored = localStorage.getItem("currentRole");
    return (stored as Role) || Role.USER;
  });
  const [currentUser, setCurrentUser] = useState<RegisteredUser | AdminUser | null>(() => {
    const stored = localStorage.getItem("currentUser");
    return stored ? JSON.parse(stored) : null;
  });
  const [systemLogo, setSystemLogo] = useState(DEFAULT_LOGO);
  const [loading, setLoading] = useState(true);

  const refreshAll = useCallback(async () => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    try {
      const me = await api.me();
      const role = me.role as Role;
      setCurrentUser(me.user as RegisteredUser | AdminUser);
      setCurrentRole(role);

      const logoRes = await api.getLogo().catch(() => ({ logo: null }));
      setSystemLogo(resolveLogoUrl(logoRes.logo));

      const [entriesRes, notifRes, msgRes] = await Promise.all([
        api.getEntries({ page: 1, limit: 500 }),
        api.getNotifications(),
        api.getMessages(),
      ]);
      setEntries(entriesRes.entries as UserEntry[]);
      setNotifications(notifRes.notifications as Notification[]);
      setHumanMessages(msgRes.messages as HumanMessage[]);

      if (role === Role.SUPER_ADMIN || role === Role.CITY_ADMIN) {
        const [blRes, incRes, alertRes, bcRes] = await Promise.all([
          api.getBlacklist({ page: 1, limit: 500 }),
          api.getIncidents({ page: 1, limit: 500 }),
          api.getEmergencies(),
          api.getBroadcasts(),
        ]);
        setBlacklist(blRes.blacklist as BlacklistEntry[]);
        setIncidents(incRes.incidents as Incident[]);
        setEmergencyAlerts(alertRes.alerts as EmergencyAlert[]);
        setBroadcasts(bcRes.broadcasts as typeof broadcasts);

        const { admins: a } = await api.getAdmins({ page: 1, limit: 500 });
        setAdmins(a as AdminUser[]);

        const { users: u } = await api.getUsers({ page: 1, limit: 500 });
        setUsers(u as RegisteredUser[]);
      } else if (role === Role.BORDER_OFFICER) {
        const incRes = await api.getIncidents({ page: 1, limit: 500 });
        setIncidents(incRes.incidents as Incident[]);
        setBlacklist([]);
        setEmergencyAlerts([]);
        setAdmins([]);
        setUsers([]);
      } else {
        setBlacklist([]);
        setIncidents([]);
        setEmergencyAlerts([]);
        setAdmins([]);
        setUsers([]);
      }
    } catch (e) {
      console.error("Failed to load data:", e);
      if (String(e).includes("401") || String(e).includes("Invalid")) {
        setToken(null);
        setCurrentUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    localStorage.setItem("currentRole", currentRole);
    if (currentUser) localStorage.setItem("currentUser", JSON.stringify(currentUser));
    else localStorage.removeItem("currentUser");
  }, [currentRole, currentUser]);

  const addNotification = (message: string, actionUrl?: string) => {
    setNotifications((prev) => [
      {
        id: Math.random().toString(36).slice(2, 9),
        message,
        date: new Date().toISOString(),
        read: false,
        actionUrl,
      },
      ...prev,
    ]);
  };

  const loginUser = async (email: string, password: string) => {
    try {
      const { token, user, role } = await api.login(email, password);
      setToken(token);
      setCurrentUser(user as RegisteredUser | AdminUser);
      setCurrentRole((role || roleFromUser(user)) as Role);
      setLoading(true);
      await refreshAll();
      return { success: true, user: user as RegisteredUser | AdminUser };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Login failed";
      return { success: false, message };
    }
  };

  const logoutUser = () => {
    setToken(null);
    setCurrentUser(null);
    setEntries([]);
    setAdmins([]);
    setUsers([]);
    setBlacklist([]);
    setIncidents([]);
    setEmergencyAlerts([]);
    setNotifications([]);
    setHumanMessages([]);
    localStorage.removeItem("currentUser");
  };

  const registerUser = async (
    email: string,
    password: string,
    responsibility: string,
    creatorId?: string
  ) => {
    try {
      await api.register(email, password, responsibility, creatorId);
      await refreshAll();
      return { success: true, message: "User created successfully" };
    } catch (e: unknown) {
      return { success: false, message: e instanceof Error ? e.message : "Failed" };
    }
  };

  const verifyUser = async () => ({ success: true, message: "Already active" });
  const resendVerification = () => {};

  const updateCurrentUserProfile = async (data: Partial<AdminUser | RegisteredUser>) => {
    const { user } = await api.updateProfile(data as Record<string, unknown>);
    setCurrentUser(user as RegisteredUser | AdminUser);
    if (currentRole === Role.SUPER_ADMIN && (data as AdminUser).photoUrl) {
      setSystemLogo((data as AdminUser).photoUrl!);
    }
    await refreshAll();
  };

  const changeCurrentUserPassword = async (oldPassword: string, newPassword: string) => {
    try {
      await api.changePassword(oldPassword, newPassword);
      return { success: true, message: "Password updated successfully" };
    } catch (e: unknown) {
      return { success: false, message: e instanceof Error ? e.message : "Failed" };
    }
  };

  const addEntry = async (
    entryData: Omit<UserEntry, "id" | "status" | "submittedAt" | "updatedAt" | "auditHistory">
  ) => {
    try {
      const { entry, watchlistWarning } = await api.addEntry(entryData as Record<string, unknown>);
      setEntries((prev) => [entry as UserEntry, ...prev]);
      if (watchlistWarning) {
        addNotification(`WATCHLIST: ${watchlistWarning.fullName} flagged — enhanced review required.`);
      }
      addNotification("Entry submitted successfully.");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Submit failed";
      if (msg.includes("BLACKLIST")) {
        addNotification("SECURITY ALERT: Blacklisted individual detected — travel blocked!");
      } else {
        addNotification(msg);
      }
    }
  };

  const editEntry = async (id: string, data: Partial<UserEntry>) => {
    const { entry } = await api.editEntry(id, data as Record<string, unknown>);
    setEntries((prev) => prev.map((e) => (e.id === id ? (entry as UserEntry) : e)));
  };

  const transferEntry = async (id: string, city: string, comments?: string) => {
    const { entry } = await api.transferEntry(id, city, comments);
    setEntries((prev) => prev.map((e) => (e.id === id ? (entry as UserEntry) : e)));
    addNotification(`Entry transferred to ${city}`);
    await refreshAll();
  };

  const updateEntryStatus = async (id: string, status: EntryStatus, comments?: string) => {
    const { entry } = await api.updateEntryStatus(id, status, comments);
    setEntries((prev) => prev.map((e) => (e.id === id ? (entry as UserEntry) : e)));
    addNotification(`Entry status updated to ${status.replace(/_/g, " ")}`);
    await refreshAll();
  };

  const deleteEntry = async (id: string) => {
    await api.deleteEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const addToBlacklist = async (
    entry: Omit<BlacklistEntry, "id" | "addedAt" | "addedBy">
  ) => {
    await api.addBlacklist(entry as Record<string, unknown>);
    await refreshAll();
    addNotification(`Added to list: ${entry.fullName}`);
  };

  const removeFromBlacklist = async (id: string) => {
    await api.removeBlacklist(id);
    setBlacklist((prev) => prev.filter((b) => b.id !== id));
  };

  const addAdmin = async (adminData: Omit<AdminUser, "id">) => {
    await api.addAdmin(adminData as Record<string, unknown>);
    await refreshAll();
  };

  const updateAdmin = async (id: string, data: Partial<AdminUser>) => {
    await api.updateAdmin(id, data as Record<string, unknown>);
    await refreshAll();
  };

  const deleteAdmin = async (id: string) => {
    await api.deleteAdmin(id);
    await refreshAll();
  };

  const resetAdminPassword = async (id: string, newPassword: string) => {
    await api.updateAdmin(id, { password: newPassword });
  };

  const toggleAdminStatus = async (id: string, status: "ACTIVE" | "INACTIVE") => {
    await api.updateAdmin(id, { status });
    await refreshAll();
  };

  const updateUser = async (id: string, data: Partial<RegisteredUser>) => {
    await api.updateUser(id, data as Record<string, unknown>);
    await refreshAll();
  };

  const deleteUser = async (userId: string) => {
    await api.deleteUser(userId);
    await refreshAll();
  };

  const sendHumanMessage = async (
    content: string,
    receiverId: string,
    type: HumanMessage["type"] = "text",
    mediaUrl?: string,
    duration?: number,
    fileName?: string,
    fileSize?: string
  ) => {
    await api.sendMessage({
      content,
      receiverId,
      type,
      mediaUrl,
      duration,
      fileName,
      fileSize,
    });
    const { messages } = await api.getMessages();
    setHumanMessages(messages as HumanMessage[]);
  };

  const markMessagesAsRead = async (userId?: string) => {
    if (userId) await api.markMessagesRead(userId);
    const { messages } = await api.getMessages();
    setHumanMessages(messages as HumanMessage[]);
  };

  const addIncident = async (incident: Omit<Incident, "id" | "timestamp" | "status">) => {
    await api.addIncident(incident as Record<string, unknown>);
    await refreshAll();
    addNotification(`Incident reported: ${incident.type}`);
  };

  const updateIncidentStatus = async (id: string, status: Incident["status"]) => {
    await api.updateIncidentStatus(id, status);
    await refreshAll();
  };

  const triggerEmergency = async () => {
    await api.triggerEmergency({ location: "Current checkpoint", alertType: "PANIC" });
    await refreshAll();
    addNotification("URGENT: Emergency alert sent!");
  };

  const resolveEmergency = async (id: string) => {
    await api.resolveEmergency(id);
    setEmergencyAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "RESOLVED" as const } : a))
    );
  };

  const sendBroadcast = async (
    title: string,
    message: string,
    targetRole?: string,
    targetCity?: string
  ) => {
    await api.sendBroadcast({ title, message, targetRole, targetCity });
    const { broadcasts: bc } = await api.getBroadcasts();
    setBroadcasts(bc as typeof broadcasts);
    addNotification(`Broadcast sent: ${title}`);
  };

  if (loading && getToken()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-600 font-medium">Loading PBMS...</p>
      </div>
    );
  }

  return (
    <StoreContext.Provider
      value={{
        entries,
        addEntry,
        editEntry,
        transferEntry,
        updateEntryStatus,
        deleteEntry,
        admins,
        addAdmin,
        updateAdmin,
        deleteAdmin,
        resetAdminPassword,
        toggleAdminStatus,
        users,
        currentUser,
        registerUser,
        updateUser,
        verifyUser,
        loginUser,
        logoutUser,
        deleteUser,
        resendVerification,
        updateCurrentUserProfile,
        changeCurrentUserPassword,
        notifications,
        addNotification,
        currentRole,
        setCurrentRole,
        systemLogo,
        blacklist,
        addToBlacklist,
        removeFromBlacklist,
        humanMessages,
        sendHumanMessage,
        markMessagesAsRead,
        incidents,
        addIncident,
        updateIncidentStatus,
        emergencyAlerts,
        triggerEmergency,
        resolveEmergency,
        broadcasts,
        sendBroadcast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within a StoreProvider");
  return context;
};
