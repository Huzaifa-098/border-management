
import React from 'react';
import { useStore } from '../services/mockStore';
import { EntryStatus, Role } from '../types';
import { getScopedEntries } from '../utils/scopeData';
import { useAppNavigation } from '../context/AppNavigationContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, FileCheck, FileX, Clock, ShieldCheck, Ban, ChevronRight, Zap, TrendingUp } from 'lucide-react';
import { VividStat, SectionCard } from './ui';

const CHART_COLORS = ['#8b5cf6', '#06b6d4', '#f97316', '#f43f5e', '#10b981', '#e879f9'];

interface DashboardStatsProps {
  onStatClick?: (stat: string) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ onStatClick }) => {
  const { entries, users, admins, currentRole, currentUser, blacklist } = useStore();
  const { cityFilter } = useAppNavigation();
  const scopedEntries = getScopedEntries(entries, users, currentRole, currentUser, cityFilter, admins);

  let primaryTitle = 'Total Users';
  let primaryValue = 0;
  let PrimaryIcon = Users;
  let primaryKey = 'TOTAL_USERS';

  if (currentRole === Role.SUPER_ADMIN) {
    primaryTitle = 'City Admins';
    primaryValue = admins.filter((a) => a.role === Role.CITY_ADMIN).length;
    PrimaryIcon = ShieldCheck;
    primaryKey = 'TOTAL_CITY_ADMINS';
  } else if (currentRole === Role.CITY_ADMIN) {
    primaryTitle = 'My Users';
    primaryValue = users.filter((u) => u.createdByAdminId === currentUser?.id).length;
  } else {
    primaryTitle = 'My Entries';
    primaryValue = scopedEntries.length;
  }

  const pendingCity = scopedEntries.filter((e) => e.status === EntryStatus.PENDING_CITY).length;
  const pendingSuper = scopedEntries.filter((e) => e.status === EntryStatus.PENDING_SUPER).length;
  const displayPending = currentRole === Role.CITY_ADMIN ? pendingCity : currentRole === Role.SUPER_ADMIN ? pendingSuper : pendingCity + pendingSuper;
  const approved = scopedEntries.filter((e) => e.status === EntryStatus.APPROVED).length;
  const rejected = scopedEntries.filter((e) => e.status === EntryStatus.REJECTED).length;
  const returned = scopedEntries.filter((e) => e.status === EntryStatus.RETURNED).length;

  const statusData = [
    { name: 'Pending City', value: pendingCity, fill: '#f97316' },
    { name: 'Pending Super', value: pendingSuper, fill: '#8b5cf6' },
    { name: 'Approved', value: approved, fill: '#10b981' },
    { name: 'Rejected', value: rejected, fill: '#f43f5e' },
    { name: 'Returned', value: returned, fill: '#06b6d4' },
  ].filter((d) => d.value > 0);

  const cityData = scopedEntries.reduce((acc, entry) => {
    const city = entry.originCity || 'Unknown';
    const ex = acc.find((i) => i.name === city);
    if (ex) ex.users += 1;
    else acc.push({ name: city, users: 1 });
    return acc;
  }, [] as { name: string; users: number }[]);

  const quickLinks =
    currentRole === Role.SUPER_ADMIN
      ? [
          { key: 'TOTAL_CITY_ADMINS', label: 'City Admins', icon: ShieldCheck, grad: 'linear-gradient(135deg,#8b5cf6,#6366f1)' },
          { key: 'TOTAL_USERS', label: 'All Users', icon: Users, grad: 'linear-gradient(135deg,#06b6d4,#3b82f6)' },
          { key: 'BLACKLIST', label: 'Blacklist', icon: Ban, grad: 'linear-gradient(135deg,#f43f5e,#e879f9)' },
        ]
      : currentRole === Role.CITY_ADMIN
        ? [{ key: 'TOTAL_USERS', label: 'Manage Users', icon: Users, grad: 'linear-gradient(135deg,#06b6d4,#8b5cf6)' }]
        : [];

  return (
    <div className="space-y-5 vivid-animate-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <VividStat title={primaryTitle} value={primaryValue} icon={PrimaryIcon} gradIndex={0} onClick={onStatClick ? () => onStatClick(primaryKey) : undefined} />
        {currentRole === Role.SUPER_ADMIN ? (
          <VividStat title="Blacklisted" value={blacklist.length} icon={Ban} gradIndex={3} onClick={onStatClick ? () => onStatClick('BLACKLIST') : undefined} />
        ) : (
          <VividStat title="Approved" value={approved} icon={FileCheck} gradIndex={4} />
        )}
        <VividStat title="Pending" value={displayPending} icon={Clock} gradIndex={2} trend="Action needed" />
        <VividStat title="Rejected" value={rejected} icon={FileX} gradIndex={5} />
      </div>

      {quickLinks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickLinks.map((link) => (
            <button
              key={link.key}
              type="button"
              onClick={() => onStatClick?.(link.key)}
              className="flex items-center gap-4 p-4 rounded-2xl text-white text-left transition-all hover:scale-[1.02] hover:shadow-xl"
              style={{ background: link.grad, boxShadow: '0 8px 24px -6px rgb(0 0 0 / 0.25)' }}
            >
              <div className="p-3 rounded-2xl bg-white/25">
                <link.icon size={22} />
              </div>
              <div className="flex-1 font-extrabold">{link.label}</div>
              <ChevronRight size={20} className="opacity-70" />
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Status Breakdown" subtitle="Live pipeline" color="violet" actions={<Zap size={20} className="text-amber-300" />}>
          <div className="h-72">
            {statusData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-violet-400 font-bold">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={4} dataKey="value" cornerRadius={8}>
                    {statusData.map((d, i) => <Cell key={i} fill={d.fill} stroke="none" />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 16, border: 'none', fontWeight: 700, boxShadow: '0 12px 32px rgb(139 92 246 / 0.2)' }} />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Regional Traffic" subtitle="Entries by origin" color="cyan" actions={<TrendingUp size={20} className="text-amber-300" />}>
          <div className="h-72">
            {cityData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-cyan-500 font-bold">No regional data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cityData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e7ff" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#7c3aed', fontSize: 11, fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7c3aed', fontSize: 11 }} />
                  <Tooltip cursor={{ fill: '#f5f3ff' }} contentStyle={{ borderRadius: 16, border: 'none', fontWeight: 700 }} />
                  <Bar dataKey="users" fill="url(#barGrad)" radius={[10, 10, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};
