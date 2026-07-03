import React, { useMemo, useState, useRef } from 'react';
import { useStore } from '../services/mockStore';
import { Role, EntryStatus, AdminUser, RegisteredUser } from '../types';
import {
  FileBarChart, Users, CheckCircle, XCircle, Undo2, Clock, MapPin,
  Download, Loader2, BookOpen, Activity, Calendar,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PageShell, SectionCard, BtnPrimary } from './ui';
import { LogoImage } from './LogoImage';
import { pushToast } from '../services/feedbackStore';

interface AdminReportingProps {
  onBack: () => void;
}

declare global {
  interface Window {
    html2pdf?: {
      (): {
        set: (opt: object) => { from: (el: HTMLElement) => { save: () => Promise<void> } };
      };
    };
  }
}

export const AdminReporting: React.FC<AdminReportingProps> = ({ onBack }) => {
  const { admins, users, entries, currentUser, currentRole, systemLogo } = useStore();
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<'REPORT' | 'GUIDE'>('REPORT');
  const reportRef = useRef(`REF-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`);

  const superAdmin = admins.find((a) => a.role === Role.SUPER_ADMIN);
  const reportLogo = superAdmin?.photoUrl || systemLogo;

  const reportData = useMemo(() => {
    let cityAdmins = admins.filter((a) => a.role === Role.CITY_ADMIN);
    if (currentRole === Role.CITY_ADMIN && currentUser) {
      cityAdmins = cityAdmins.filter((a) => a.id === currentUser.id);
    }
    return cityAdmins.map((admin) => {
      const adminUsers = users.filter((u) => u.createdByAdminId === admin.id);
      const adminUserIds = adminUsers.map((u) => u.id);
      const adminEntries = entries.filter((e) => adminUserIds.includes(e.userId || ''));
      return {
        id: admin.id,
        name: admin.name,
        city: admin.assignedCity || 'Unassigned',
        totalUsers: adminUsers.length,
        approved: adminEntries.filter((e) => e.status === EntryStatus.APPROVED).length,
        rejected: adminEntries.filter((e) => e.status === EntryStatus.REJECTED).length,
        returned: adminEntries.filter((e) => e.status === EntryStatus.RETURNED).length,
        pending: adminEntries.filter((e) => e.status === EntryStatus.PENDING_CITY || e.status === EntryStatus.PENDING_SUPER).length,
      };
    });
  }, [admins, users, entries, currentRole, currentUser]);

  const globalStats = useMemo(() => ({
    users: reportData.reduce((a, c) => a + c.totalUsers, 0),
    approved: reportData.reduce((a, c) => a + c.approved, 0),
    rejected: reportData.reduce((a, c) => a + c.rejected, 0),
    returned: reportData.reduce((a, c) => a + c.returned, 0),
    pending: reportData.reduce((a, c) => a + c.pending, 0),
  }), [reportData]);

  const getUserName = () => {
    if (!currentUser) return 'System Admin';
    return 'name' in currentUser ? (currentUser as AdminUser).name : (currentUser as RegisteredUser).fullName;
  };

  const handleDownload = async () => {
    const element = document.getElementById('admin-report-content');
    if (!element) {
      pushToast('error', 'Report content not found.');
      return;
    }

    setIsDownloading(true);
    const filename = `PBMS_Report_${new Date().toISOString().split('T')[0]}.pdf`;

    try {
      if (window.html2pdf) {
        await window
          .html2pdf()
          .set({
            margin: [0.4, 0.4, 0.4, 0.4],
            filename,
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: { scale: 2, useCORS: true, logging: false, scrollY: 0 },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
          })
          .from(element)
          .save();
        pushToast('success', `Report downloaded as ${filename}`);
      } else {
        window.print();
        pushToast('info', 'Opening print dialog — save as PDF from there.');
      }
    } catch (err) {
      console.error('PDF export failed:', err);
      pushToast('warning', 'PDF export failed — opening print dialog instead.');
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const reportDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <PageShell
      title="Performance Reporting"
      subtitle={currentRole === Role.SUPER_ADMIN ? 'National oversight across all jurisdictions' : 'Your regional performance summary'}
      onBack={onBack}
      actions={
        activeTab === 'REPORT' ? (
          <BtnPrimary onClick={handleDownload} disabled={isDownloading} className="print:hidden">
            {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            {isDownloading ? 'Generating…' : 'Download PDF'}
          </BtnPrimary>
        ) : undefined
      }
    >
      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit print:hidden">
        <button
          type="button"
          onClick={() => setActiveTab('REPORT')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'REPORT' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <FileBarChart size={16} /> Report
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('GUIDE')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'GUIDE' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <BookOpen size={16} /> Guide
        </button>
      </div>

      {activeTab === 'GUIDE' ? (
        <SectionCard>
          <h2 className="text-lg font-bold text-slate-800 mb-2">How to read this report</h2>
          <p className="text-sm text-slate-500 mb-6">Metrics help evaluate border processing efficiency per city administrator.</p>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2"><Users size={16} /> Scope</h3>
              <p className="text-slate-600 text-xs leading-relaxed"><strong>Managed Users</strong> — travelers registered under each city admin.</p>
              <p className="text-slate-600 text-xs leading-relaxed"><strong>Jurisdiction</strong> — city assigned to the administrator.</p>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2"><Activity size={16} /> Statuses</h3>
              <p className="text-slate-600 text-xs flex items-start gap-2"><CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" /> <span><strong>Approved</strong> — permit issued</span></p>
              <p className="text-slate-600 text-xs flex items-start gap-2"><Undo2 size={14} className="text-orange-500 shrink-0 mt-0.5" /> <span><strong>Returned</strong> — sent back for fixes</span></p>
              <p className="text-slate-600 text-xs flex items-start gap-2"><XCircle size={14} className="text-red-500 shrink-0 mt-0.5" /> <span><strong>Rejected</strong> — denied entry</span></p>
              <p className="text-slate-600 text-xs flex items-start gap-2"><Clock size={14} className="text-slate-400 shrink-0 mt-0.5" /> <span><strong>Pending</strong> — awaiting review</span></p>
            </div>
          </div>
          <p className="mt-6 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3">
            <strong>Approval rate</strong> = Approved ÷ (Approved + Rejected + Returned) × 100%
          </p>
        </SectionCard>
      ) : (
        <div id="admin-report-content" className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          {/* Report header */}
          <div className="px-6 py-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <LogoImage src={reportLogo} className="h-14 w-14 rounded-full object-cover border-2 border-slate-200" alt="Seal" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ministry of Interior</p>
                <h2 className="text-xl font-bold text-slate-900">Puntland Border Management System</h2>
                <p className="text-xs text-slate-500">Official Performance Report</p>
              </div>
            </div>
            <div className="text-left md:text-right text-sm">
              <p className="font-mono text-xs text-slate-500 bg-slate-100 inline-block px-2 py-0.5 rounded">{reportRef.current}</p>
              <p className="font-medium text-slate-800 mt-1 flex items-center md:justify-end gap-1">
                <Calendar size={14} className="text-slate-400" /> {reportDate}
              </p>
              <p className="text-xs text-slate-500">Prepared by {getUserName()}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="px-6 py-4 border-b border-slate-100 grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'Users', value: globalStats.users, color: 'text-slate-800' },
              { label: 'Approved', value: globalStats.approved, color: 'text-emerald-600' },
              { label: 'Pending', value: globalStats.pending, color: 'text-amber-600' },
              { label: 'Returned', value: globalStats.returned, color: 'text-orange-600' },
              { label: 'Rejected', value: globalStats.rejected, color: 'text-red-600' },
            ].map((s) => (
              <div key={s.label} className="text-center py-2 px-3 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          {reportData.length > 0 && (
            <div className="px-6 py-5 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">By City</h3>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="city" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="approved" name="Approved" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="returned" name="Returned" stackId="a" fill="#f59e0b" />
                    <Bar dataKey="rejected" name="Rejected" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Table — full width */}
          <div className="px-6 py-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Jurisdiction Details</h3>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-xs uppercase text-slate-500 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Administrator</th>
                    <th className="px-4 py-3 text-center">Users</th>
                    <th className="px-4 py-3 text-center">Approved</th>
                    <th className="px-4 py-3 text-center">Returned</th>
                    <th className="px-4 py-3 text-center">Rejected</th>
                    <th className="px-4 py-3 text-center">Pending</th>
                    <th className="px-4 py-3 text-right">Approval %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.map((row) => {
                    const processed = row.approved + row.rejected + row.returned;
                    const rate = processed > 0 ? Math.round((row.approved / processed) * 100) : 0;
                    return (
                      <tr key={row.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-800">{row.name}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin size={10} /> {row.city}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-center font-mono font-semibold">{row.totalUsers}</td>
                        <td className="px-4 py-3 text-center font-semibold text-emerald-600">{row.approved}</td>
                        <td className="px-4 py-3 text-center font-semibold text-orange-600">{row.returned}</td>
                        <td className="px-4 py-3 text-center font-semibold text-red-600">{row.rejected}</td>
                        <td className="px-4 py-3 text-center text-slate-500">{row.pending}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${rate >= 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                            {rate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {reportData.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-slate-400 text-sm">No data available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">
              Confidential — Ministry of Interior — Generated via PBMS
            </p>
          </div>
        </div>
      )}
    </PageShell>
  );
};
