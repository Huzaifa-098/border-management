
// ... [Existing Imports]
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../services/mockStore';
import { api, defaultPagination } from '../services/api';
import { EntryStatus, Role, UserEntry, AdminUser, GPSData } from '../types';
import { TablePagination, SearchInput, FilterPills, EntityCard, IconBtn, StatusBadge as UiStatusBadge } from './ui';
import { entryPhotoUrl } from '../utils/entryPhoto';
import { LogoImage } from './LogoImage';
import { pushToast } from '../services/feedbackStore';
import { Check, X, Undo2, Search, Filter, Eye, Calendar, User, MapPin, Shield, Briefcase, FileText, Truck, Users, CreditCard, Package, ShieldAlert, AlertTriangle, History, Clock, Map, Navigation, LocateFixed, Signal, Battery, Activity, Send, ArrowRightLeft, Lock, CreditCard as IdCard, BadgeCheck } from 'lucide-react';

// ... [TrackingModal Component remains unchanged] ...
// Live GPS Tracking Modal Component
const TrackingModal: React.FC<{ entry: UserEntry; onClose: () => void }> = ({ entry, onClose }) => {
    const [gpsData, setGpsData] = useState<GPSData>(entry.gps || {
        latitude: 8.4064,
        longitude: 48.4819,
        speed: 0,
        heading: 0,
        lastUpdated: new Date().toISOString(),
        status: 'IDLE',
        batteryLevel: 80,
        signalStrength: 'GOOD'
    });

    // Simulate Live Movement
    useEffect(() => {
        const interval = setInterval(() => {
            setGpsData(prev => ({
                ...prev,
                latitude: prev.latitude + (Math.random() - 0.5) * 0.001,
                longitude: prev.longitude + (Math.random() - 0.5) * 0.001,
                speed: Math.max(0, Math.min(120, prev.speed + (Math.random() - 0.5) * 10)),
                lastUpdated: new Date().toISOString(),
                status: prev.speed > 5 ? 'MOVING' : 'IDLE',
                heading: (prev.heading + (Math.random() - 0.5) * 10) % 360
            }));
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[10040] flex flex-col animate-in fade-in duration-300">
            {/* Toolbar */}
            <div className="bg-slate-900 text-white p-4 border-b border-slate-700 flex justify-between items-center shadow-lg z-10">
                <div className="flex items-center gap-4">
                     <div className="p-2 bg-blue-600 rounded-lg">
                        <Truck size={24} className="text-white" />
                     </div>
                     <div>
                        <h3 className="font-bold text-lg leading-none">{entry.fullName}</h3>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                           <span className="font-mono bg-slate-800 px-1.5 rounded text-blue-400">{entry.vehicle?.registrationNumber || '—'}</span>
                           <span>• {entry.vehicleModel || entry.vehicle?.type || '—'}</span>
                        </p>
                     </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-4 text-xs font-mono">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full border border-slate-700">
                            <Activity size={14} className="text-green-500" />
                            <span className={gpsData.status === 'MOVING' ? 'text-green-400' : 'text-amber-400'}>{gpsData.status}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full border border-slate-700">
                            <Signal size={14} className={gpsData.signalStrength === 'WEAK' ? 'text-red-500' : 'text-green-500'} />
                            <span>{gpsData.signalStrength}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full border border-slate-700">
                            <Battery size={14} className={gpsData.batteryLevel && gpsData.batteryLevel < 20 ? 'text-red-500' : 'text-green-500'} />
                            <span>{gpsData.batteryLevel}%</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Map Area */}
            <div className="flex-1 relative bg-slate-900 overflow-hidden">
                {/* Simulated Map Background */}
                <div 
                    className="absolute inset-0 opacity-40 grayscale hover:grayscale-0 transition-all duration-1000"
                    style={{ 
                        backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/2000px-World_map_blank_without_borders.svg.png')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                ></div>
                
                {/* Grid Overlay */}
                <div className="absolute inset-0" style={{ 
                    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)', 
                    backgroundSize: '50px 50px' 
                }}></div>

                {/* Vehicle Marker */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                        <div className="absolute -inset-8 bg-blue-500/20 rounded-full animate-ping"></div>
                        <div className="absolute -inset-16 bg-blue-500/10 rounded-full animate-pulse"></div>
                        <div 
                            className="relative z-10 w-12 h-12 bg-blue-600 rounded-full border-4 border-white shadow-2xl flex items-center justify-center transform transition-transform duration-1000"
                            style={{ transform: `rotate(${gpsData.heading}deg)` }}
                        >
                            <Navigation size={20} className="text-white" fill="white" />
                        </div>
                        <div className="absolute top-14 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 text-white px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-700 shadow-xl backdrop-blur-sm">
                            {gpsData.speed.toFixed(0)} km/h
                        </div>
                    </div>
                </div>

                {/* Radar Scan Effect */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-blue-500/10 rounded-full"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-blue-500/10 rounded-full"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-blue-500/10 rounded-full"></div>
                </div>

                {/* Telemetry Sidebar */}
                <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur border border-slate-700 p-4 rounded-xl shadow-2xl w-64 space-y-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <LocateFixed size={12} /> Live Telemetry
                    </h4>

                    {/* Journey Details */}
                    <div className="grid grid-cols-1 gap-3 pb-3 border-b border-slate-800">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                                <span className="text-xs text-slate-400 uppercase font-bold">From</span>
                            </div>
                            <div className="text-sm font-bold text-white pl-4 truncate">{entry.originCity}</div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                <span className="text-xs text-blue-500 uppercase font-bold">To</span>
                            </div>
                            <div className="text-sm font-bold text-white pl-4 truncate">{entry.destinationCity}</div>
                        </div>
                    </div>

                    {/* Real-time Location */}
                    <div>
                        <span className="block text-xs text-slate-500 mb-2 uppercase font-bold">Real-time Location</span>
                        <div className="bg-slate-800 rounded-lg p-3 border border-slate-700 mb-4">
                             <div className="flex justify-between items-center mb-1">
                                 <span className="text-xs text-slate-400">Lat</span>
                                 <span className="font-mono text-sm text-blue-400">{gpsData.latitude.toFixed(6)}</span>
                             </div>
                             <div className="flex justify-between items-center">
                                 <span className="text-xs text-slate-400">Long</span>
                                 <span className="font-mono text-sm text-blue-400">{gpsData.longitude.toFixed(6)}</span>
                             </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <span className="block text-xs text-slate-500">Speed</span>
                                <span className="font-mono text-lg font-bold text-white">{gpsData.speed.toFixed(1)} <span className="text-xs font-normal text-slate-500">km/h</span></span>
                            </div>
                            <div>
                                <span className="block text-xs text-slate-500">Heading</span>
                                <span className="font-mono text-lg font-bold text-white">{gpsData.heading.toFixed(0)}°</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800">
                        <div className="flex justify-between items-center text-xs">
                             <span className="text-slate-500">Last Ping</span>
                             <span className="text-emerald-400 font-mono">
                                {new Date(gpsData.lastUpdated).toLocaleTimeString()}
                             </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ... [EntryList Component] ...
interface EntryListProps {
    cityFilter?: string;
    previewLimit?: number;
    logoUrl?: string;
}

export const EntryList: React.FC<EntryListProps> = ({ cityFilter, previewLimit = 0, logoUrl }) => {
  const { updateEntryStatus, editEntry, transferEntry, currentRole, currentUser, users, admins, blacklist } = useStore();
  const [filterStatus, setFilterStatus] = useState<EntryStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [listEntries, setListEntries] = useState<UserEntry[]>([]);
  const [pagination, setPagination] = useState(defaultPagination);
  const [listLoading, setListLoading] = useState(false);
  const [galleryEntries, setGalleryEntries] = useState<UserEntry[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<UserEntry | null>(null);
  const [trackingEntry, setTrackingEntry] = useState<UserEntry | null>(null);
  const [adminComment, setAdminComment] = useState('');
  const [returnComment, setReturnComment] = useState('');
  
  // Transfer Logic State
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferCity, setTransferCity] = useState('');

  const availableCities = Array.from(new Set(admins.filter(a => a.role === Role.CITY_ADMIN && a.assignedCity).map(a => a.assignedCity!)));

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [filterStatus, debouncedSearch, cityFilter]);

  const pendingStatus =
    currentRole === Role.SUPER_ADMIN
      ? EntryStatus.PENDING_SUPER
      : currentRole === Role.CITY_ADMIN
        ? EntryStatus.PENDING_CITY
        : undefined;

  const loadGallery = useCallback(async () => {
    if (!previewLimit) return;
    setGalleryLoading(true);
    try {
      const res = await api.getEntries({
        page: 1,
        limit: previewLimit,
        status: pendingStatus,
        city: cityFilter && cityFilter !== 'ALL' ? cityFilter : undefined,
      });
      setGalleryEntries(res.entries as UserEntry[]);
    } catch (e) {
      console.error('Failed to load entry gallery:', e);
    } finally {
      setGalleryLoading(false);
    }
  }, [previewLimit, pendingStatus, cityFilter]);

  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  const loadEntries = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await api.getEntries({
        page,
        limit,
        status: filterStatus === 'ALL' ? undefined : filterStatus,
        search: debouncedSearch || undefined,
        city: cityFilter && cityFilter !== 'ALL' ? cityFilter : undefined,
      });
      setListEntries(res.entries as UserEntry[]);
      setPagination(res.pagination);
    } catch (e) {
      console.error('Failed to load entries:', e);
    } finally {
      setListLoading(false);
    }
  }, [page, limit, filterStatus, debouncedSearch, cityFilter]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const checkBlacklist = (entry: UserEntry) => {
    const namesToCheck = [entry.fullName];
    if (entry.vehicle?.driverName) namesToCheck.push(entry.vehicle.driverName);
    if (entry.passengers) entry.passengers.forEach(p => namesToCheck.push(p.fullName));

    return blacklist.filter(bItem => 
        namesToCheck.some(name => name && name.trim().toLowerCase() === bItem.fullName.trim().toLowerCase())
    );
  };

  const handleAction = async (id: string, action: 'approve' | 'reject' | 'return' | 'transfer') => {
    if (action === 'approve') {
      const nextStatus = currentRole === Role.CITY_ADMIN ? EntryStatus.PENDING_SUPER : EntryStatus.APPROVED;
      await updateEntryStatus(id, nextStatus, adminComment);
      setAdminComment('');
      setSelectedEntry(null);
    } else if (action === 'reject') {
      await updateEntryStatus(id, EntryStatus.REJECTED, adminComment);
      setAdminComment('');
      setSelectedEntry(null);
    } else if (action === 'return') {
      if (!returnComment) {
          pushToast('warning', 'Please provide a reason for returning this entry.');
          return;
      }
      await updateEntryStatus(id, EntryStatus.RETURNED, returnComment);
      setReturnComment('');
      setSelectedEntry(null);
    } else if (action === 'transfer') {
        if (!transferCity) {
            pushToast('warning', 'Please select a city to transfer to.');
            return;
        }
        editEntry(id, { originCity: transferCity });
        await transferEntry(id, transferCity, `Transferred jurisdiction to ${transferCity}`);
        setIsTransferring(false);
        setTransferCity('');
        setSelectedEntry(null);
    }
    await loadEntries();
    await loadGallery();
  };

  const StatusBadge = ({ status }: { status: EntryStatus }) => {
    const styles = {
      [EntryStatus.PENDING_CITY]: 'bg-amber-50 text-amber-700 ring-amber-600/20',
      [EntryStatus.PENDING_SUPER]: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
      [EntryStatus.APPROVED]: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
      [EntryStatus.REJECTED]: 'bg-red-50 text-red-700 ring-red-600/20',
      [EntryStatus.RETURNED]: 'bg-orange-50 text-orange-700 ring-orange-600/20',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ring-1 inset-0 ${styles[status]}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const statusOptions = [
    { value: 'ALL', label: 'All' },
    ...Object.values(EntryStatus).map((s) => ({ value: s, label: s.replace(/_/g, ' ') })),
  ];

  const entryTypeLabel = (type: string) =>
    type === 'DRIVER' ? 'Logistics' : type === 'DRIVER_ID' ? 'ID Card' : type === 'OFFICIAL_ID' ? 'Official ID' : 'Passenger';

  return (
    <div className="space-y-4">
      {previewLimit > 0 && (
        <div className="rounded-3xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 via-white to-cyan-50 p-4 md:p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <LogoImage src={logoUrl} className="h-12 w-12 object-contain rounded-xl bg-white p-1.5 shadow-md border border-violet-100" />
            <div className="flex-1">
              <h4 className="font-extrabold text-violet-900 text-lg">Quick Photo Review</h4>
              <p className="text-sm font-medium text-violet-600/80">
                {galleryLoading
                  ? 'Loading from server...'
                  : `${galleryEntries.length} pending — tap any photo to open full review`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {Array.from({ length: previewLimit }).map((_, idx) => {
              const entry = galleryEntries[idx];
              if (!entry) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="aspect-[3/4] rounded-2xl border-2 border-dashed border-violet-200 bg-white/60 flex flex-col items-center justify-center text-violet-300"
                  >
                    <User size={28} className="opacity-40 mb-2" />
                    <span className="text-[10px] font-bold uppercase">No entry</span>
                  </div>
                );
              }
              const isRisky = checkBlacklist(entry).length > 0;
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setSelectedEntry(entry)}
                  className={`group relative aspect-[3/4] rounded-2xl overflow-hidden border-4 transition-all hover:scale-[1.03] hover:shadow-xl ${
                    isRisky ? 'border-rose-400' : 'border-violet-200 hover:border-fuchsia-400'
                  }`}
                >
                  <img
                    src={entryPhotoUrl(entry, 500)}
                    alt={entry.fullName}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = entryPhotoUrl({ ...entry, photoUrl: '' }, 500);
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-indigo-950/90 via-indigo-900/50 to-transparent p-3 pt-10 text-left">
                    <p className="text-white font-extrabold text-xs truncate">{entry.fullName}</p>
                    <p className="text-cyan-200 text-[10px] font-semibold truncate mt-0.5">
                      {entry.originCity} → {entry.destinationCity}
                    </p>
                  </div>
                  {isRisky && (
                    <span className="absolute top-2 right-2 bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                      ALERT
                    </span>
                  )}
                  <span className="absolute top-2 left-2 bg-black/50 text-white text-[9px] font-bold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    Review →
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <div className="flex-1 max-w-md">
          <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search name or registration..." icon={Search} />
        </div>
        <FilterPills options={statusOptions} value={filterStatus} onChange={(v) => setFilterStatus(v as EntryStatus | 'ALL')} />
      </div>

      {listLoading && (
        <div className="py-16 text-center text-slate-500 text-sm">Loading entries...</div>
      )}

      {!listLoading && listEntries.length === 0 && (
        <div className="py-16 text-center rounded-3xl border-2 border-dashed border-violet-200 bg-gradient-to-br from-violet-50 to-cyan-50">
          <p className="text-violet-500 font-extrabold">No entries found</p>
        </div>
      )}

      <div className="grid gap-3">
        {!listLoading && listEntries.map((entry) => {
          const blacklistMatches = checkBlacklist(entry);
          const isRisky = blacklistMatches.length > 0;
          const entryOwner = users.find((u) => u.id === entry.userId);
          const isTransferredUser = entryOwner?.isTransferred;
          const canApprove =
            !isTransferredUser &&
            ((currentRole === Role.CITY_ADMIN && entry.status === EntryStatus.PENDING_CITY) ||
              (currentRole === Role.SUPER_ADMIN && entry.status === EntryStatus.PENDING_SUPER));

          return (
            <EntityCard
              key={entry.id}
              variant={isRisky ? 'danger' : 'default'}
              onClick={() => setSelectedEntry(entry)}
              avatar={
                <div className="relative">
                  <img
                    src={entryPhotoUrl(entry, 200)}
                    alt=""
                    className={`h-12 w-12 rounded-xl object-cover border-2 ${isRisky ? 'border-red-300' : 'border-slate-100'}`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = entryPhotoUrl({ ...entry, photoUrl: '' }, 200);
                    }}
                  />
                  {isRisky && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white p-0.5 rounded-full">
                      <ShieldAlert size={10} />
                    </span>
                  )}
                </div>
              }
              title={entry.fullName}
              subtitle={
                entry.entryType === 'OFFICIAL_ID'
                  ? `${entry.department || 'Government'} · Badge ${entry.badgeNumber || 'N/A'}`
                  : `${entry.vehicle?.registrationNumber || '—'} · ${entry.vehicle?.type || ''}`
              }
              badges={
                <>
                  <UiStatusBadge
                    label={entry.status.replace(/_/g, ' ')}
                    variant={
                      entry.status === EntryStatus.APPROVED ? 'success' :
                      entry.status === EntryStatus.REJECTED ? 'danger' :
                      entry.status.includes('PENDING') ? 'warning' : 'neutral'
                    }
                  />
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {entryTypeLabel(entry.entryType)}
                  </span>
                  {isRisky && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">BLACKLIST</span>}
                  {isTransferredUser && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">VIEW ONLY</span>}
                </>
              }
              meta={
                entry.entryType !== 'DRIVER_ID' && entry.entryType !== 'OFFICIAL_ID' ? (
                  <>
                    <span className="flex items-center gap-1"><MapPin size={12} /> {entry.originCity} → {entry.destinationCity}</span>
                    <span>{entry.purpose}</span>
                  </>
                ) : (
                  <span>{entry.entryType === 'OFFICIAL_ID' ? 'Authority ID — No expiry' : `Valid until ${entry.expiryDate || 'N/A'}`}</span>
                )
              }
              actions={
                <>
                  {canApprove && (
                    <>
                      <IconBtn variant="success" title="Approve" onClick={() => handleAction(entry.id, 'approve')}><Check size={16} /></IconBtn>
                      <IconBtn variant="danger" title="Reject" onClick={() => handleAction(entry.id, 'reject')}><X size={16} /></IconBtn>
                      {currentRole === Role.CITY_ADMIN && (
                        <IconBtn variant="warning" title="Return" onClick={() => setSelectedEntry(entry)}><Undo2 size={16} /></IconBtn>
                      )}
                    </>
                  )}
                  {(entry.gps || entry.entryType === 'DRIVER') && (
                    <IconBtn
                      variant="primary"
                      title="Track GPS"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTrackingEntry(entry);
                      }}
                    >
                      <Map size={16} />
                    </IconBtn>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEntry(entry);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-colors flex items-center gap-1"
                  >
                    <Eye size={14} /> {isTransferredUser ? 'View' : 'Review'}
                  </button>
                </>
              }
            />
          );
        })}
      </div>

      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
        <TablePagination
          pagination={pagination}
          onPageChange={setPage}
          onLimitChange={(n) => { setLimit(n); setPage(1); }}
        />
      </div>

      {/* Detail / Review Modal via Portal */}
      {selectedEntry && createPortal(
        <div className="fixed inset-0 bg-indigo-950/50 backdrop-blur-md z-[9999] flex items-center justify-center p-3 sm:p-4 vivid-animate-in">
          <div className="review-modal max-w-4xl w-full">
            {/* Header */}
            <div className={`review-modal-header shrink-0 ${
              selectedEntry.entryType === 'DRIVER' ? 'driver' :
              selectedEntry.entryType === 'DRIVER_ID' ? 'driver-id' :
              selectedEntry.entryType === 'OFFICIAL_ID' ? 'official' : 'passenger'
            }`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 shrink-0">
                  {selectedEntry.entryType === 'DRIVER' ? <Truck size={22} /> :
                   selectedEntry.entryType === 'DRIVER_ID' ? <IdCard size={22} /> :
                   selectedEntry.entryType === 'OFFICIAL_ID' ? <BadgeCheck size={22} /> : <FileText size={22} />}
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-lg sm:text-xl leading-tight truncate">
                    {selectedEntry.entryType === 'DRIVER' ? 'Vehicle Entry Review' :
                     selectedEntry.entryType === 'DRIVER_ID' ? 'ID Card Application Review' :
                     selectedEntry.entryType === 'OFFICIAL_ID' ? 'Authority ID Application Review' : 'Passenger Entry Review'}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-white/85 mt-1">
                    <span className="font-mono bg-white/20 px-2 py-0.5 rounded-md">#{selectedEntry.id.substring(0, 8)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Calendar size={11} /> {new Date(selectedEntry.submittedAt).toLocaleDateString()}</span>
                    <span className="bg-white/25 text-white px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wide border border-white/30">
                      {selectedEntry.status.replace(/_/g, ' ')}
                    </span>
                    {users.find(u => u.id === selectedEntry.userId)?.isTransferred && (
                      <span className="bg-white/20 px-2 py-0.5 rounded-md font-bold flex items-center gap-1"><Lock size={10} /> VIEW ONLY</span>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedEntry(null)} className="p-2 hover:bg-white/20 rounded-xl transition-colors shrink-0 border border-white/20">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1 bg-gradient-to-b from-white to-indigo-50/30">
              {/* Blacklist Alert */}
              {(() => {
                const matches = checkBlacklist(selectedEntry);
                if (matches.length === 0) return null;
                return (
                  <div className="mb-5 bg-gradient-to-r from-rose-50 to-red-50 border-2 border-rose-300 p-4 rounded-2xl shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-rose-500 rounded-xl text-white shrink-0"><ShieldAlert size={22} /></div>
                      <div>
                        <h3 className="font-extrabold text-rose-800">Security Warning — Blacklist Match</h3>
                        <div className="mt-2 space-y-1.5">
                          {matches.map(m => (
                            <div key={m.id} className="text-sm font-bold text-rose-900 bg-white/70 px-3 py-1.5 rounded-lg border border-rose-200">
                              {m.fullName} — {m.reason}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                {/* Left — Profile & Details */}
                <div className="lg:col-span-3 space-y-4">
                  <div className="review-section">
                    <h4 className="review-section-title">Profile Details</h4>
                    <div className="flex gap-5">
                      <img
                        src={entryPhotoUrl(selectedEntry, 500)}
                        alt={selectedEntry.fullName}
                        className="review-photo shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = entryPhotoUrl({ ...selectedEntry, photoUrl: '' }, 500);
                        }}
                      />
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Full Name</span>
                          <span className="font-extrabold text-slate-900 text-base">{selectedEntry.fullName}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Phone</span>
                          <span className="font-semibold text-slate-700">{selectedEntry.contactNumber}</span>
                        </div>

                        {selectedEntry.entryType === 'DRIVER_ID' && (
                          <>
                            <div><span className="block text-[10px] font-bold text-emerald-600 uppercase mb-0.5">Age</span><span className="font-semibold text-slate-700">{selectedEntry.age}</span></div>
                            <div><span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">License</span><span className="font-mono text-sm bg-violet-50 px-2 py-1 rounded-lg border border-violet-100">{selectedEntry.driverLicenseNumber}</span></div>
                            <div><span className="block text-[10px] font-bold text-emerald-600 uppercase mb-0.5">Ownership</span><span className="font-bold text-slate-800">{selectedEntry.vehicleOwnership}</span></div>
                            <div><span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Expiry</span><span className="font-semibold text-rose-600">{selectedEntry.expiryDate}</span></div>
                          </>
                        )}

                        {selectedEntry.entryType === 'OFFICIAL_ID' && (
                          <>
                            <div className="sm:col-span-2"><span className="block text-[10px] font-bold text-blue-600 uppercase mb-0.5">Department</span><span className="font-extrabold text-slate-800">{selectedEntry.department}</span></div>
                            <div><span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Rank / Role</span><span className="font-semibold text-slate-700">{selectedEntry.officialRole}</span></div>
                            <div><span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Badge #</span><span className="font-mono text-sm bg-blue-50 px-2 py-1 rounded-lg border border-blue-100 text-blue-800 font-bold">{selectedEntry.badgeNumber}</span></div>
                          </>
                        )}

                        {selectedEntry.entryType === 'PASSENGER' && (
                          <>
                            <div><span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Details</span><span className="font-semibold text-slate-700">{selectedEntry.age} yrs • {selectedEntry.maritalStatus}</span></div>
                            <div><span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Birthplace</span><span className="font-semibold text-slate-700">{selectedEntry.placeOfBirth}</span></div>
                            <div className="sm:col-span-2"><span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Purpose</span><span className="font-semibold text-violet-700">{selectedEntry.purpose}</span></div>
                          </>
                        )}

                        {selectedEntry.entryType === 'DRIVER' && (
                          <>
                            <div><span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Purpose</span><span className="font-semibold text-violet-700">{selectedEntry.purpose}</span></div>
                            <div><span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Assigned City</span><span className="font-semibold text-slate-700">{selectedEntry.assignedCity}</span></div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedEntry.entryType === 'PASSENGER' && selectedEntry.passengers && selectedEntry.passengers.length > 0 && (
                    <div className="review-section">
                      <h4 className="review-section-title">Accompanying ({selectedEntry.passengers.length})</h4>
                      <div className="space-y-2">
                        {selectedEntry.passengers.map((p, i) => (
                          <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-indigo-100">
                            <img src={p.photoUrl} className="h-11 w-11 rounded-lg object-cover border-2 border-white shadow-sm" alt="" />
                            <div className="flex-1 text-sm">
                              <span className="font-bold text-slate-800">{p.fullName}</span>
                              <span className="text-slate-400 text-xs ml-2">{p.age} yrs • {p.maritalStatus}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedEntry.entryType === 'DRIVER' && (
                    <div className="review-section">
                      <h4 className="review-section-title">Cargo Manifest</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
                        <div className="bg-white rounded-xl p-3 border border-indigo-100">
                          <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Vehicle Owner</span>
                          <span className="font-extrabold text-slate-800">{vehicleOwnerLabel(selectedEntry)}</span>
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-indigo-100">
                          <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Model</span>
                          <span className="font-extrabold text-slate-800">{vehicleModelLabel(selectedEntry)}</span>
                        </div>
                      </div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Description of Goods</span>
                      <div className="review-cargo-box">{selectedEntry.cargoType || 'No Cargo Declared'}</div>
                    </div>
                  )}

                  {selectedEntry.adminComments && (
                    <div className="review-section">
                      <h4 className="review-section-title">Previous Remarks</h4>
                      <p className="text-sm text-slate-600 leading-relaxed bg-white rounded-xl p-3 border border-indigo-100">{selectedEntry.adminComments}</p>
                    </div>
                  )}
                </div>

                {/* Right — Trip & Actions */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="review-section">
                    <h4 className="review-section-title">
                      {selectedEntry.entryType === 'DRIVER_ID' ? 'Vehicle Info' :
                       selectedEntry.entryType === 'OFFICIAL_ID' ? 'Badge Info' : 'Trip Summary'}
                    </h4>

                    {selectedEntry.entryType === 'OFFICIAL_ID' ? (
                      <div className="review-reg-box">
                        <div className="text-[10px] text-violet-500 font-extrabold uppercase tracking-wider mb-1">Official ID</div>
                        <div className="text-xl font-mono font-extrabold text-indigo-800 tracking-wider">{selectedEntry.badgeNumber}</div>
                        <div className="text-xs text-slate-500 mt-1 font-medium">{selectedEntry.department}</div>
                      </div>
                    ) : (
                      <div className="review-reg-box">
                        <div className="text-[10px] text-violet-500 font-extrabold uppercase tracking-wider mb-1">Registration</div>
                        <div className="text-2xl font-mono font-extrabold text-indigo-900 tracking-wider">{selectedEntry.vehicle.registrationNumber}</div>
                        <div className="text-xs text-slate-500 mt-1 font-semibold">{vehicleModelLabel(selectedEntry)}</div>
                      </div>
                    )}

                    {(selectedEntry.entryType !== 'DRIVER_ID' && selectedEntry.entryType !== 'OFFICIAL_ID') && (
                      <div className="review-timeline space-y-5 mt-5">
                        <div className="relative pl-2">
                          <div className="review-timeline-dot text-slate-400" />
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide block">Origin</span>
                          <span className="text-base font-extrabold text-slate-800">{selectedEntry.originCity}</span>
                        </div>
                        <div className="relative pl-2">
                          <div className="review-timeline-dot text-indigo-500" />
                          <span className="text-[10px] text-indigo-500 font-extrabold uppercase tracking-wide block">Destination</span>
                          <span className="text-base font-extrabold text-slate-800">{selectedEntry.destinationCity}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="review-actions-panel">
                    {users.find(u => u.id === selectedEntry.userId)?.isTransferred ? (
                      <div className="text-center py-2">
                        <StatusBadge status={selectedEntry.status} />
                        <p className="text-xs text-slate-500 mt-3 font-semibold">Record is view-only.</p>
                      </div>
                    ) : (
                      ((currentRole === Role.CITY_ADMIN && selectedEntry.status === EntryStatus.PENDING_CITY) ||
                      (currentRole === Role.SUPER_ADMIN && selectedEntry.status === EntryStatus.PENDING_SUPER)) ? (
                        <>
                          <label className="text-[10px] font-extrabold text-violet-600 uppercase tracking-wider block mb-2">Admin Remarks</label>
                          <textarea
                            className="vivid-input w-full min-h-[88px] resize-none mb-4 text-sm"
                            placeholder="Write comments..."
                            value={adminComment}
                            onChange={e => setAdminComment(e.target.value)}
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <button type="button" onClick={() => handleAction(selectedEntry.id, 'approve')} className="vivid-btn vivid-btn-emerald w-full py-3">
                              <Check size={18} /> Approve
                            </button>
                            <button type="button" onClick={() => handleAction(selectedEntry.id, 'reject')} className="w-full py-3 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 bg-white text-rose-600 border-2 border-rose-200 hover:bg-rose-50 transition-all active:scale-95">
                              <X size={18} /> Reject
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-2">
                          <StatusBadge status={selectedEntry.status} />
                          <p className="text-xs text-slate-500 mt-3 font-semibold">
                            {selectedEntry.status === EntryStatus.APPROVED ? 'Processed & Finalized' : 'Awaiting Further Action'}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {trackingEntry && createPortal(
        <TrackingModal entry={trackingEntry} onClose={() => setTrackingEntry(null)} />,
        document.body
      )}
    </div>
  );
};

// Helper styles for types
const vehicleOwnerLabel = (e: UserEntry) => e.vehicleOwner || e.vehicle?.driverName || e.fullName || 'Not specified';
const vehicleModelLabel = (e: UserEntry) => e.vehicleModel || e.vehicle?.type || 'Not specified';

const entryTypeColor = (type: string) => {
    if (type === 'DRIVER') return 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white';
    if (type === 'DRIVER_ID') return 'bg-gradient-to-br from-green-500 to-green-600 text-white';
    if (type === 'OFFICIAL_ID') return 'bg-gradient-to-br from-blue-600 to-blue-800 text-white';
    return 'bg-gradient-to-br from-blue-500 to-blue-600 text-white';
};

const entryTypeBg = (type: string) => {
    if (type === 'DRIVER') return 'bg-indigo-500';
    if (type === 'DRIVER_ID') return 'bg-green-500';
    if (type === 'OFFICIAL_ID') return 'bg-blue-600';
    return 'bg-blue-500';
};
