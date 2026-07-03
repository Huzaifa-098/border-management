import React, { useState } from "react";
import { useStore } from "../services/mockStore";
import { ArrowLeft, Megaphone, Send } from "lucide-react";
import { PageShell, SectionCard, BtnPrimary } from "./ui";
import { Role } from "../types";

export const BroadcastManagement: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { broadcasts, sendBroadcast, currentRole } = useStore();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [targetCity, setTargetCity] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setSending(true);
    try {
      await sendBroadcast(
        title.trim(),
        message.trim(),
        targetRole || undefined,
        targetCity || undefined
      );
      setTitle("");
      setMessage("");
      setTargetRole("");
      setTargetCity("");
    } finally {
      setSending(false);
    }
  };

  return (
    <PageShell
      title="Broadcast Center"
      subtitle="Mass announcements to roles, cities, or all checkpoints"
      onBack={onBack}
      accent="indigo"
    >
      <SectionCard title="Send Broadcast" subtitle="Delivered as in-app notifications">
        <form onSubmit={handleSend} className="space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Announcement title"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
            required
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message body..."
            rows={4}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm resize-none"
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white"
            >
              <option value="">All roles</option>
              <option value={Role.BORDER_OFFICER}>Border Officers</option>
              <option value={Role.CITY_ADMIN}>City Admins</option>
              <option value={Role.USER}>Travelers</option>
            </select>
            <input
              value={targetCity}
              onChange={(e) => setTargetCity(e.target.value)}
              placeholder="Target city (optional)"
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
            />
          </div>
          <BtnPrimary type="submit" disabled={sending}>
            <Send size={16} /> {sending ? "Sending..." : "Send Broadcast"}
          </BtnPrimary>
        </form>
      </SectionCard>

      <SectionCard title="Recent Broadcasts" noPadding>
        <div className="divide-y divide-slate-100">
          {broadcasts.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">No broadcasts sent yet.</p>
          ) : (
            broadcasts.map((b) => (
              <div key={b.id} className="p-4 flex gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg h-fit">
                  <Megaphone size={18} className="text-indigo-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{b.title}</p>
                  <p className="text-sm text-slate-600 mt-1">{b.message}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    {b.sentByName} · {new Date(b.sentAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </SectionCard>
    </PageShell>
  );
};
