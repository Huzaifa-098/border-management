import React, { useEffect, useState, useCallback } from 'react';
import {
  MapPin, Navigation, Truck, Clock, Radio, Activity, Signal, Users,
  ArrowRight, Map, Gauge, CheckCircle2, Play,
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { api, defaultPagination } from '../services/api';
import { useStore } from '../services/mockStore';
import { Role } from '../types';
import {
  PageShell, SectionCard, TablePagination, VividStat, StatusBadge,
  FilterPills, IconBtn, EmptyState,
} from './ui';

interface Trip {
  id: string;
  vehicleReg: string;
  driverName: string;
  originCity: string;
  destinationCity: string;
  status: string;
  passengerCount: number;
  departedAt?: string;
  arrivedAt?: string;
  gps?: { latitude: number; longitude: number; speed?: number };
  eta?: string;
}

const statusVariant = (s: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' => {
  if (s === 'IN_TRANSIT') return 'warning';
  if (s === 'COMPLETED' || s === 'ARRIVED') return 'success';
  if (s === 'APPROVED') return 'info';
  return 'neutral';
};

const GpsModal: React.FC<{ trip: Trip; onClose: () => void }> = ({ trip, onClose }) => {
  const gps = trip.gps || { latitude: 8.4064, longitude: 48.4819, speed: 0 };
  return createPortal(
    <div className="fixed inset-0 z-[10040] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden vivid-animate-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-lg">Live GPS — {trip.vehicleReg}</h3>
              <p className="text-white/85 text-sm font-medium">{trip.driverName}</p>
            </div>
            <button type="button" onClick={onClose} className="p-2 rounded-xl bg-white/20 hover:bg-white/30">✕</button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-violet-50 to-cyan-50 border-2 border-violet-100">
            <MapPin className="text-violet-600 shrink-0" size={22} />
            <div>
              <p className="text-xs font-extrabold text-violet-600 uppercase">Route</p>
              <p className="font-extrabold text-slate-900">{trip.originCity} → {trip.destinationCity}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase">Latitude</p>
              <p className="font-mono font-bold text-indigo-700">{gps.latitude.toFixed(6)}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase">Longitude</p>
              <p className="font-mono font-bold text-indigo-700">{gps.longitude.toFixed(6)}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 col-span-2">
              <p className="text-[10px] font-extrabold text-amber-600 uppercase flex items-center gap-1">
                <Gauge size={12} /> Speed
              </p>
              <p className="font-mono font-extrabold text-amber-800 text-xl">
                {gps.speed != null ? `${Math.round(gps.speed)} km/h` : '—'}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-500 text-center font-medium">Simulated GPS feed — production connects to device trackers</p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export const TripTracking: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { currentRole, currentUser } = useStore();
  const [statsTrips, setStatsTrips] = useState<Trip[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState(defaultPagination);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [gpsTrip, setGpsTrip] = useState<Trip | null>(null);

  const city =
    currentRole === Role.CITY_ADMIN
      ? (currentUser as { assignedCity?: string })?.assignedCity
      : null;

  const loadStats = useCallback(async () => {
    try {
      const { trips: t } = await api.getTrips({ page: 1, limit: 500 });
      setStatsTrips(t as Trip[]);
    } catch (e) {
      console.error('Failed to load trip stats:', e);
    }
  }, []);

  const loadTrips = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getTrips({
        page,
        limit,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });
      setTrips(res.trips as Trip[]);
      setPagination(res.pagination);
    } catch (e) {
      console.error('Failed to load trips:', e);
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter]);

  useEffect(() => {
    loadStats();
    const iv = setInterval(loadStats, 15000);
    return () => clearInterval(iv);
  }, [loadStats]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    const gps = {
      latitude: 8.4 + Math.random() * 0.2,
      longitude: 48.4 + Math.random() * 0.2,
      speed: 45 + Math.random() * 30,
    };
    try {
      await api.updateTripStatus(id, status, status === 'IN_TRANSIT' ? gps : undefined);
      await loadTrips();
      await loadStats();
    } catch {
      /* API toast */
    }
  };

  const departing = statsTrips.filter((t) => !city || t.originCity === city);
  const arriving = statsTrips.filter((t) => !city || t.destinationCity === city);
  const inTransit = statsTrips.filter((t) => t.status === 'IN_TRANSIT');

  const canManage = currentRole === Role.CITY_ADMIN || currentRole === Role.SUPER_ADMIN;

  const statusOptions = [
    { value: 'ALL', label: 'All Trips' },
    { value: 'APPROVED', label: 'Scheduled' },
    { value: 'IN_TRANSIT', label: 'In Transit' },
    { value: 'COMPLETED', label: 'Completed' },
  ];

  return (
    <PageShell
      title="Vehicle Transit Tracking"
      subtitle="Real-time inter-city vehicle monitoring & GPS coordination"
      onBack={onBack}
      actions={
        inTransit.length > 0 ? (
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/20 border border-white/30 text-sm font-extrabold">
            <Radio size={16} className="text-rose-300 animate-pulse" />
            {inTransit.length} Live
          </span>
        ) : undefined
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <VividStat title="In Transit" value={inTransit.length} icon={Navigation} gradIndex={2} trend="Active now" />
        <VividStat title="Departing" value={departing.length} icon={Truck} gradIndex={1} trend={city ? `From ${city}` : 'All origins'} />
        <VividStat title="Incoming" value={arriving.length} icon={MapPin} gradIndex={4} trend={city ? `To ${city}` : 'All destinations'} />
      </div>

      <SectionCard noPadding>
        <div className="px-4 py-4 border-b-2 border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-white to-cyan-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-indigo-900 text-lg">Active &amp; Scheduled Trips</h3>
            <p className="text-xs text-indigo-600/70 font-semibold mt-0.5">Monitor departures, arrivals and live GPS</p>
          </div>
          <FilterPills options={statusOptions} value={statusFilter} onChange={setStatusFilter} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-slate-800 to-indigo-900 text-white">
                <th className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-widest">Vehicle &amp; Driver</th>
                <th className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-widest">Route</th>
                <th className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-widest">Passengers</th>
                <th className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-widest">GPS / Speed</th>
                <th className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-widest">Status</th>
                <th className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-slate-500 font-semibold">
                    Loading trips...
                  </td>
                </tr>
              )}
              {!loading && trips.map((t, idx) => (
                <tr
                  key={t.id}
                  className={`border-b border-slate-100 transition-colors ${
                    t.status === 'IN_TRANSIT'
                      ? 'bg-gradient-to-r from-amber-50/80 to-orange-50/40 border-l-4 border-l-amber-500'
                      : idx % 2 === 0
                        ? 'bg-white hover:bg-indigo-50/30'
                        : 'bg-slate-50/50 hover:bg-indigo-50/30'
                  }`}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3 min-w-[180px]">
                      <div className={`p-2.5 rounded-xl shrink-0 ${
                        t.status === 'IN_TRANSIT'
                          ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md'
                          : 'bg-indigo-100 text-indigo-600'
                      }`}>
                        <Truck size={20} />
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900 font-mono">{t.vehicleReg}</p>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">{t.driverName || 'Driver'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200">{t.originCity}</span>
                      <ArrowRight size={14} className="text-violet-500 shrink-0" />
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800">{t.destinationCity}</span>
                    </div>
                    {t.departedAt && (
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">
                        Departed {new Date(t.departedAt).toLocaleString()}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 font-bold text-slate-700">
                      <Users size={14} className="text-violet-400" />
                      {t.passengerCount}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {t.gps ? (
                      <div className="space-y-0.5">
                        <p className="font-mono text-[11px] text-slate-600">
                          {t.gps.latitude.toFixed(4)}, {t.gps.longitude.toFixed(4)}
                        </p>
                        {t.gps.speed != null && (
                          <p className="text-xs font-extrabold text-amber-600 flex items-center gap-1">
                            <Activity size={12} /> {Math.round(t.gps.speed)} km/h
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">No GPS yet</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge label={t.status.replace(/_/g, ' ')} variant={statusVariant(t.status)} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2 flex-wrap">
                      {(t.status === 'IN_TRANSIT' || t.gps) && (
                        <IconBtn variant="primary" title="View GPS" onClick={() => setGpsTrip(t)}>
                          <Map size={16} />
                        </IconBtn>
                      )}
                      {canManage && t.status === 'APPROVED' && (
                        <button
                          type="button"
                          onClick={() => updateStatus(t.id, 'IN_TRANSIT')}
                          className="vivid-btn vivid-btn-orange px-3 py-2 text-xs"
                        >
                          <Play size={14} /> Start Transit
                        </button>
                      )}
                      {canManage && t.status === 'IN_TRANSIT' && (
                        <button
                          type="button"
                          onClick={() => updateStatus(t.id, 'COMPLETED')}
                          className="vivid-btn vivid-btn-emerald px-3 py-2 text-xs"
                        >
                          <CheckCircle2 size={14} /> Mark Arrived
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && trips.length === 0 && (
            <EmptyState
              icon={Truck}
              title="No trips found"
              description={statusFilter !== 'ALL' ? 'Try a different status filter.' : 'Approved vehicle entries will appear here as scheduled trips.'}
            />
          )}
        </div>

        <TablePagination
          pagination={pagination}
          onPageChange={setPage}
          onLimitChange={(n) => { setLimit(n); setPage(1); }}
        />
      </SectionCard>

      {inTransit.length > 0 && (
        <div
          className="rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 text-white vivid-animate-in"
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #0e7490 100%)',
            boxShadow: '0 16px 40px -8px rgb(30 27 75 / 0.5)',
          }}
        >
          <div className="p-3 rounded-2xl bg-rose-500/30 border border-rose-400/40 shrink-0">
            <Radio size={24} className="text-rose-300 animate-pulse" />
          </div>
          <div className="flex-1">
            <p className="font-extrabold text-lg flex items-center gap-2">
              <Signal size={18} className="text-emerald-400" />
              Live GPS Monitoring Active
            </p>
            <p className="text-sm text-indigo-200/90 font-medium mt-1">
              {inTransit.length} vehicle(s) in transit — destination cities notified automatically when transit begins.
            </p>
          </div>
          <div className="flex items-center gap-2 text-indigo-300 text-sm font-mono shrink-0">
            <Clock size={16} />
            Updated {new Date().toLocaleTimeString()}
          </div>
        </div>
      )}

      {gpsTrip && <GpsModal trip={gpsTrip} onClose={() => setGpsTrip(null)} />}
    </PageShell>
  );
};
