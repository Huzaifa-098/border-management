import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  MapPin, Calendar, User, CheckCircle2,
  ShieldCheck, Clock, Check, Search,
} from 'lucide-react';
import { useStore } from '../services/mockStore';
import { api, defaultPagination } from '../services/api';
import { Role, Incident } from '../types';
import {
  PageShell, EmptyState, TablePagination, Modal, BtnSecondary, useConfirm,
} from './ui';

const statusLabel = (s: string) => (s === 'REPORTED' ? 'Pending' : s.charAt(0) + s.slice(1).toLowerCase());

const statusClass = (s: string) => {
  if (s === 'RESOLVED') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (s === 'ESCALATED') return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  if (s === 'REVIEWING') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-orange-50 text-orange-700 border-orange-200';
};

const typeClass = (type: string) => {
  const danger = ['Security Threat', 'Suspicious Person', 'Suspicious Vehicle', 'Illegal Border Crossing', 'Document Forgery', 'Smuggling Activities'];
  if (danger.includes(type)) return 'bg-red-50 text-red-700 border-red-200';
  if (type === 'Medical Emergency') return 'bg-rose-50 text-rose-700 border-rose-200';
  if (type === 'Vehicle Breakdown' || type === 'Route Delay') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-slate-100 text-slate-600 border-slate-200';
};

export const IncidentManagement: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { updateIncidentStatus, currentRole } = useStore();
  const { confirm, ConfirmDialog } = useConfirm();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);
  const [listIncidents, setListIncidents] = useState<Incident[]>([]);
  const [pagination, setPagination] = useState(defaultPagination);
  const [loading, setLoading] = useState(false);
  const [viewIncident, setViewIncident] = useState<Incident | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterType, filterStatus]);

  const loadIncidents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getIncidents({
        page,
        limit,
        search: debouncedSearch || undefined,
        type: filterType !== 'ALL' ? filterType : undefined,
        status: filterStatus !== 'ALL' ? filterStatus : undefined,
      });
      setListIncidents(res.incidents as Incident[]);
      setPagination(res.pagination);
    } catch (e) {
      console.error('Failed to load incidents:', e);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, filterType, filterStatus]);

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  const counts = useMemo(() => ({
    open: listIncidents.filter((i) => i.status !== 'RESOLVED').length,
    escalated: listIncidents.filter((i) => i.status === 'ESCALATED').length,
  }), [listIncidents]);

  const handleForward = async (incident: Incident) => {
    const ok = await confirm({
      title: 'Escalate to HQ?',
      message: `Forward this incident to national command?`,
      confirmLabel: 'Yes, Escalate',
      cancelLabel: 'Cancel',
    });
    if (!ok) return;
    try {
      await updateIncidentStatus(incident.id, 'ESCALATED');
      setViewIncident(null);
      await loadIncidents();
    } catch { /* toast */ }
  };

  const handleResolve = async (incident: Incident) => {
    const ok = await confirm({
      title: 'Mark as resolved?',
      message: 'Close this incident report?',
      confirmLabel: 'Yes, Resolve',
      cancelLabel: 'Cancel',
    });
    if (!ok) return;
    try {
      await updateIncidentStatus(incident.id, 'RESOLVED');
      setViewIncident(null);
      await loadIncidents();
    } catch { /* toast */ }
  };

  const renderActions = (incident: Incident) => {
    if (incident.status === 'RESOLVED') {
      return (
        <div className="w-full py-2 text-center text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center justify-center gap-1.5">
          <CheckCircle2 size={14} /> Resolved
        </div>
      );
    }
    if (currentRole === Role.CITY_ADMIN && incident.status === 'REPORTED') {
      return (
        <div className="flex gap-2">
          <button type="button" onClick={() => handleForward(incident)} className="flex-1 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">
            Forward to HQ
          </button>
          <button type="button" onClick={() => handleResolve(incident)} className="flex-1 py-2 text-xs font-semibold text-emerald-700 bg-white border border-emerald-200 hover:bg-emerald-50 rounded-lg">
            Resolve
          </button>
        </div>
      );
    }
    if (currentRole === Role.CITY_ADMIN && incident.status === 'ESCALATED') {
      return (
        <div className="w-full py-2 text-center text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-lg border border-indigo-100 flex items-center justify-center gap-1.5">
          <ShieldCheck size={14} /> Forwarded to HQ
        </div>
      );
    }
    if (currentRole === Role.SUPER_ADMIN || incident.status === 'REVIEWING') {
      return (
        <button type="button" onClick={() => handleResolve(incident)} className="w-full py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center justify-center gap-1.5">
          <Check size={14} /> Mark as Resolved
        </button>
      );
    }
    return null;
  };

  return (
    <PageShell
      title="Incident Reports"
      subtitle={currentRole === Role.SUPER_ADMIN ? 'National oversight & escalations' : 'City-level incident management'}
      onBack={onBack}
    >
      {/* Compact toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reports..."
            className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white min-w-[140px]"
        >
          <option value="ALL">All Types</option>
          <option value="Suspicious Vehicle">Suspicious Vehicle</option>
          <option value="Smuggling Activities">Smuggling</option>
          <option value="Document Forgery">Document Forgery</option>
          <option value="Vehicle Breakdown">Breakdown</option>
          <option value="Medical Emergency">Medical</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white min-w-[130px]"
        >
          <option value="ALL">All Status</option>
          <option value="REPORTED">Pending</option>
          <option value="REVIEWING">Reviewing</option>
          <option value="ESCALATED">Escalated</option>
          <option value="RESOLVED">Resolved</option>
        </select>
        {!loading && (
          <span className="text-xs text-slate-500 whitespace-nowrap px-1">
            {counts.open} open · {counts.escalated} escalated
          </span>
        )}
      </div>

      {loading ? (
        <p className="text-center text-slate-500 py-16 text-sm">Loading...</p>
      ) : listIncidents.length === 0 ? (
        <EmptyState icon={CheckCircle2} title="All clear" description="No incidents match your filters." />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listIncidents.map((incident) => (
              <div
                key={incident.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center gap-2 bg-slate-50/80">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${typeClass(incident.type)}`}>
                    {incident.type}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${statusClass(incident.status)}`}>
                    {incident.status === 'REPORTED' && <Clock size={10} />}
                    {incident.status === 'RESOLVED' && <CheckCircle2 size={10} />}
                    {incident.status === 'ESCALATED' && <ShieldCheck size={10} />}
                    {statusLabel(incident.status)}
                  </span>
                </div>

                <button type="button" onClick={() => setViewIncident(incident)} className="p-4 flex-1 text-left">
                  <p className="text-xs text-slate-400 flex items-center gap-1 mb-2">
                    <Calendar size={12} /> {new Date(incident.timestamp).toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-800 leading-relaxed mb-3 line-clamp-3">{incident.description}</p>
                  <p className="text-xs text-slate-600 flex items-center gap-1.5 mb-1">
                    <MapPin size={13} className="text-slate-400 shrink-0" /> {incident.location}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <User size={13} className="text-slate-400 shrink-0" /> {incident.reportedBy}
                  </p>
                </button>

                <div className="px-4 pb-4 pt-0">
                  {renderActions(incident)}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <TablePagination pagination={pagination} onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />
          </div>
        </>
      )}

      <Modal
        open={!!viewIncident}
        onClose={() => setViewIncident(null)}
        title={viewIncident?.type || 'Incident'}
        subtitle={viewIncident ? new Date(viewIncident.timestamp).toLocaleString() : ''}
        size="md"
        color="rose"
        footer={
          viewIncident ? (
            <div className="flex gap-2 justify-end w-full">
              <BtnSecondary onClick={() => setViewIncident(null)}>Close</BtnSecondary>
              {viewIncident.status !== 'RESOLVED' && (
                <div className="flex-1 max-w-xs">{renderActions(viewIncident)}</div>
              )}
            </div>
          ) : undefined
        }
      >
        {viewIncident && (
          <div className="space-y-4 text-sm">
            <p className="text-slate-700 leading-relaxed">{viewIncident.description}</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Location</p>
                <p className="font-medium text-slate-800">{viewIncident.location}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Reporter</p>
                <p className="font-medium text-slate-800">{viewIncident.reportedBy}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Severity</p>
                <p className="font-medium text-slate-800">{viewIncident.severity || 'MEDIUM'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Status</p>
                <p className="font-medium text-slate-800">{statusLabel(viewIncident.status)}</p>
              </div>
            </div>
            {viewIncident.photoUrl && (
              <img src={viewIncident.photoUrl} alt="" className="w-full rounded-lg border border-slate-200 max-h-40 object-cover" />
            )}
          </div>
        )}
      </Modal>

      {ConfirmDialog}
    </PageShell>
  );
};
