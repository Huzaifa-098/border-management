import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from '../services/mockStore';
import { api, defaultPagination } from '../services/api';
import {
  Ban, UserX, AlertTriangle, Camera, Flag, ShieldAlert, Phone, Calendar, Heart, Filter, X,
} from 'lucide-react';
import { BlacklistEntry } from '../types';
import {
  PageShell, BtnPrimary, BtnSecondary, SearchInput, SectionCard, TablePagination,
  Modal, FormField, FilterPills, IconBtn, StatusBadge, EmptyState, useConfirm,
} from './ui';
import { pushToast } from '../services/feedbackStore';

const EMPTY_ENTRY = {
  fullName: '',
  passportNumber: '',
  nationality: 'Somalia',
  reason: '',
  photoUrl: 'https://picsum.photos/seed/blacklist-new/200/200',
  phoneNumber: '',
  age: '',
  maritalStatus: 'Single',
  listType: 'BLACKLIST' as 'BLACKLIST' | 'WATCHLIST',
};

export const BlacklistManagement: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { blacklist, addToBlacklist, removeFromBlacklist } = useStore();
  const { confirm, ConfirmDialog } = useConfirm();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [listItems, setListItems] = useState<BlacklistEntry[]>([]);
  const [pagination, setPagination] = useState(defaultPagination);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterRecent, setFilterRecent] = useState(false);
  const [newEntry, setNewEntry] = useState({ ...EMPTY_ENTRY });
  const [listFilter, setListFilter] = useState<'ALL' | 'BLACKLIST' | 'WATCHLIST'>('ALL');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isRecentThreat = (item: BlacklistEntry) => {
    if (!item.lastAttemptAt) return false;
    return new Date(item.lastAttemptAt).getTime() > Date.now() - 24 * 60 * 60 * 1000;
  };

  const recentThreats = blacklist.filter(isRecentThreat);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, listFilter, filterRecent]);

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getBlacklist({
        page,
        limit,
        search: debouncedSearch || undefined,
        listType: listFilter !== 'ALL' ? listFilter : undefined,
      });
      let items = res.blacklist as BlacklistEntry[];
      if (filterRecent) items = items.filter(isRecentThreat);
      setListItems(items);
      setPagination(res.pagination);
    } catch (e) {
      console.error('Failed to load blacklist:', e);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, listFilter, filterRecent]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setNewEntry((prev) => ({ ...prev, photoUrl: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const openAddModal = () => {
    setNewEntry({ ...EMPTY_ENTRY, photoUrl: `https://picsum.photos/seed/bl-${Date.now()}/200/200` });
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.fullName || !newEntry.passportNumber || !newEntry.reason) {
      pushToast('warning', 'Please fill in all required fields.');
      return;
    }
    try {
      await addToBlacklist({
        ...newEntry,
        listType: newEntry.listType,
        age: newEntry.age ? parseInt(newEntry.age, 10) : undefined,
      });
      setShowAddModal(false);
      setNewEntry({ ...EMPTY_ENTRY });
      await loadList();
    } catch {
      /* API toast */
    }
  };

  const handleRemove = async (id: string, name: string) => {
    const ok = await confirm({
      title: 'Remove from Blacklist?',
      message: `Are you sure you want to remove "${name}"? They will be allowed entry again.`,
      confirmLabel: 'Yes, Remove',
      cancelLabel: 'No, Cancel',
    });
    if (!ok) return;
    try {
      await removeFromBlacklist(id);
      await loadList();
    } catch {
      /* API toast */
    }
  };

  const listFilterOptions = [
    { value: 'ALL', label: 'All Lists' },
    { value: 'BLACKLIST', label: 'Blacklist' },
    { value: 'WATCHLIST', label: 'Watchlist' },
  ];

  return (
    <PageShell
      title="Blacklist Management"
      subtitle="Restricted individuals denied entry or operations"
      onBack={onBack}
      accent="red"
      actions={
        <BtnPrimary variant="danger" onClick={openAddModal}>
          <UserX size={18} /> Add to Blacklist
        </BtnPrimary>
      }
    >
      {recentThreats.length > 0 && !filterRecent && (
        <div className="rounded-2xl border-2 border-rose-300 bg-gradient-to-r from-rose-50 to-red-50 p-4 flex items-start gap-4 shadow-sm">
          <div className="p-2.5 rounded-xl bg-rose-500 text-white shrink-0">
            <ShieldAlert size={22} />
          </div>
          <div className="flex-1">
            <h3 className="font-extrabold text-rose-900">Security Alert — Recent Blacklist Match</h3>
            <p className="text-sm text-rose-700 mt-1 font-medium">
              {recentThreats.length} individual(s) attempted entry in the last 24 hours.
            </p>
            <button
              type="button"
              onClick={() => setFilterRecent(true)}
              className="mt-2 text-xs font-extrabold px-3 py-1.5 rounded-full bg-rose-500 text-white hover:bg-rose-600 transition-colors"
            >
              View Recent Attempts
            </button>
          </div>
        </div>
      )}

      <SectionCard noPadding>
        {/* Toolbar */}
        <div className="p-4 border-b-2 border-rose-100 bg-gradient-to-r from-rose-50/80 via-white to-violet-50/50 flex flex-col lg:flex-row lg:items-center gap-4">
          <FilterPills
            options={listFilterOptions}
            value={listFilter}
            onChange={(v) => setListFilter(v as typeof listFilter)}
          />
          <div className="flex-1 min-w-0">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by name, passport or ID..."
              icon={Ban}
            />
          </div>
          <button
            type="button"
            onClick={() => setFilterRecent(!filterRecent)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold border-2 transition-all shrink-0 ${
              filterRecent
                ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-300/40'
                : 'bg-white text-slate-600 border-slate-200 hover:border-rose-300'
            }`}
          >
            <Filter size={14} />
            {filterRecent ? 'Showing Recent' : 'Filter Recent'}
            {recentThreats.length > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${filterRecent ? 'bg-white/25' : 'bg-rose-100 text-rose-700'}`}>
                {recentThreats.length}
              </span>
            )}
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm blacklist-table">
            <thead>
              <tr className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                <th className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-widest">Individual</th>
                <th className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-widest">Identity</th>
                <th className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-widest">Contact</th>
                <th className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-widest">Reason &amp; Date</th>
                <th className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-slate-500 font-semibold">
                    Loading restricted records...
                  </td>
                </tr>
              )}
              {!loading && listItems.map((item, idx) => {
                const isThreat = isRecentThreat(item);
                return (
                  <tr
                    key={item.id}
                    className={`border-b border-slate-100 transition-colors ${
                      isThreat
                        ? 'bg-gradient-to-r from-rose-50 to-red-50/50 border-l-4 border-l-rose-500'
                        : idx % 2 === 0
                          ? 'bg-white hover:bg-violet-50/40'
                          : 'bg-slate-50/60 hover:bg-violet-50/40'
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <div className="relative shrink-0">
                          <img
                            src={item.photoUrl}
                            alt=""
                            className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-md ring-1 ring-slate-200"
                          />
                          {isThreat && (
                            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 border-2 border-white" />
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-slate-900 truncate">{item.fullName}</p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <StatusBadge
                              label={item.listType || 'BLACKLIST'}
                              variant={item.listType === 'WATCHLIST' ? 'warning' : 'danger'}
                            />
                            <span className="text-[10px] font-bold text-slate-500 flex items-center gap-0.5">
                              <Flag size={10} /> {item.nationality}
                            </span>
                          </div>
                          {(item.age || item.maritalStatus) && (
                            <div className="flex gap-2 mt-1 text-[10px] text-slate-500 font-semibold">
                              {item.age && <span className="flex items-center gap-0.5"><Calendar size={10} /> {item.age} yrs</span>}
                              {item.maritalStatus && <span className="flex items-center gap-0.5"><Heart size={10} /> {item.maritalStatus}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Passport / ID</span>
                      <span className="font-mono text-sm font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 inline-block">
                        {item.passportNumber}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Phone</span>
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                        <Phone size={14} className="text-violet-400 shrink-0" />
                        {item.phoneNumber || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      {isThreat && (
                        <p className="text-[10px] font-extrabold text-rose-600 mb-1 flex items-center gap-1">
                          <ShieldAlert size={12} />
                          ATTEMPTED {new Date(item.lastAttemptAt!).toLocaleString()}
                        </p>
                      )}
                      <p className="text-sm font-semibold text-rose-800 leading-snug line-clamp-2" title={item.reason}>
                        {item.reason}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                        Added {new Date(item.addedAt).toLocaleDateString()} · {item.addedBy}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <IconBtn
                        variant="danger"
                        title="Remove from list"
                        onClick={() => handleRemove(item.id, item.fullName)}
                      >
                        <X size={16} />
                      </IconBtn>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!loading && listItems.length === 0 && (
            <EmptyState
              icon={AlertTriangle}
              title={filterRecent ? 'No recent attempts' : 'No records found'}
              description={filterRecent ? 'No blacklist matches in the last 24 hours.' : 'Try adjusting your search or filters.'}
              action={
                <BtnPrimary variant="danger" onClick={openAddModal}>
                  <UserX size={16} /> Add First Entry
                </BtnPrimary>
              }
            />
          )}
        </div>

        <TablePagination
          pagination={pagination}
          onPageChange={setPage}
          onLimitChange={(n) => { setLimit(n); setPage(1); }}
        />
      </SectionCard>

      {/* Add to Blacklist Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add to Blacklist"
        subtitle="Register a restricted individual — blocks border entry"
        size="lg"
        color="rose"
        footer={
          <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
            <BtnSecondary onClick={() => setShowAddModal(false)}>Cancel</BtnSecondary>
            <BtnPrimary variant="danger" onClick={() => (document.getElementById('blacklist-form') as HTMLFormElement)?.requestSubmit()}>
              <Ban size={16} /> Confirm Blacklist
            </BtnPrimary>
          </div>
        }
      >
        <form id="blacklist-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative h-28 w-28 rounded-2xl overflow-hidden border-4 border-rose-200 shadow-lg group"
            >
              <img src={newEntry.photoUrl} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-rose-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={28} />
              </div>
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload} accept="image/*" />
            </button>
          </div>

          <FormField label="Full Name *">
            <input
              required
              value={newEntry.fullName}
              onChange={(e) => setNewEntry({ ...newEntry, fullName: e.target.value })}
              className="vivid-input"
              placeholder="Enter full legal name"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="ID / Passport *">
              <input
                required
                value={newEntry.passportNumber}
                onChange={(e) => setNewEntry({ ...newEntry, passportNumber: e.target.value })}
                className="vivid-input font-mono"
                placeholder="Document number"
              />
            </FormField>
            <FormField label="Nationality *">
              <input
                required
                value={newEntry.nationality}
                onChange={(e) => setNewEntry({ ...newEntry, nationality: e.target.value })}
                className="vivid-input"
                placeholder="Country"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Phone Number">
              <input
                value={newEntry.phoneNumber}
                onChange={(e) => setNewEntry({ ...newEntry, phoneNumber: e.target.value })}
                className="vivid-input"
                placeholder="+252..."
              />
            </FormField>
            <FormField label="Age">
              <input
                type="number"
                min={1}
                max={120}
                value={newEntry.age}
                onChange={(e) => setNewEntry({ ...newEntry, age: e.target.value })}
                className="vivid-input"
                placeholder="Years"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Marital Status">
              <select
                value={newEntry.maritalStatus}
                onChange={(e) => setNewEntry({ ...newEntry, maritalStatus: e.target.value })}
                className="vivid-input"
              >
                <option>Single</option>
                <option>Married</option>
                <option>Divorced</option>
                <option>Widowed</option>
              </select>
            </FormField>
            <FormField label="List Type">
              <select
                value={newEntry.listType}
                onChange={(e) => setNewEntry({ ...newEntry, listType: e.target.value as 'BLACKLIST' | 'WATCHLIST' })}
                className="vivid-input"
              >
                <option value="BLACKLIST">Blacklist — block travel</option>
                <option value="WATCHLIST">Watchlist — enhanced review</option>
              </select>
            </FormField>
          </div>

          <FormField label="Reason for Restriction *" hint="Be specific — this appears in security checks">
            <textarea
              required
              rows={4}
              value={newEntry.reason}
              onChange={(e) => setNewEntry({ ...newEntry, reason: e.target.value })}
              className="vivid-input resize-none min-h-[100px]"
              placeholder="Detailed reason for restriction..."
            />
          </FormField>
        </form>
      </Modal>

      {ConfirmDialog}
    </PageShell>
  );
};
