
import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../services/mockStore';
import { api, defaultPagination } from '../services/api';
import { Search, UserPlus, Trash2, Shield, User, Mail, Briefcase, Phone, MapPin, Edit, Save, ArrowRightLeft, Check, Lock, Eye } from 'lucide-react';
import { RegisteredUser, Role } from '../types';
import {
  PageShell, BtnPrimary, SearchInput, SectionCard, TablePagination,
  Modal, FormField, EntityCard, IconBtn, StatusBadge, EmptyState, useConfirm,
} from './ui';
import { pushToast } from '../services/feedbackStore';

export const UserManagement: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { deleteUser, registerUser, updateUser, currentRole, currentUser, admins } = useStore();
  const { confirm, ConfirmDialog } = useConfirm();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [listUsers, setListUsers] = useState<RegisteredUser[]>([]);
  const [pagination, setPagination] = useState(defaultPagination);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [viewUser, setViewUser] = useState<RegisteredUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [transferUser, setTransferUser] = useState<RegisteredUser | null>(null);
  const [targetAdminId, setTargetAdminId] = useState('');

  const [formData, setFormData] = useState({
    id: '', fullName: '', email: '', password: '', phone: '', city: '', responsibility: '',
  });

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getUsers({ page, limit, search: debouncedSearch || undefined });
      setListUsers(res.users as RegisteredUser[]);
      setPagination(res.pagination);
    } catch (e) {
      console.error('Failed to load users:', e);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleDelete = async (user: RegisteredUser) => {
    const ok = await confirm({
      title: 'Delete User?',
      message: `Are you sure you want to delete "${user.fullName}" and all their data? This action cannot be undone.`,
      confirmLabel: 'Yes, Delete',
      cancelLabel: 'No, Cancel',
    });
    if (!ok) return;
    await deleteUser(user.id);
    setViewUser(null);
    await loadUsers();
  };

  const handleTransfer = async () => {
    if (!transferUser || !targetAdminId) {
      pushToast('warning', 'Please select a target administrator.');
      return;
    }
    const ok = await confirm({
      title: 'Transfer User?',
      message: `Transfer "${transferUser.fullName}" to another jurisdiction?`,
      confirmLabel: 'Yes, Transfer',
      cancelLabel: 'No, Cancel',
    });
    if (!ok) return;
    try {
      await updateUser(transferUser.id, { createdByAdminId: targetAdminId, isTransferred: true });
      setTransferUser(null);
      setTargetAdminId('');
      await loadUsers();
    } catch { /* API toast */ }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setFormData({ id: '', fullName: '', email: '', password: '', phone: '', city: '', responsibility: '' });
    setShowModal(true);
  };

  const openEditModal = (user: RegisteredUser) => {
    setIsEditing(true);
    setFormData({
      id: user.id, fullName: user.fullName, email: user.email, password: '',
      phone: user.phone, city: user.city, responsibility: user.responsibility || '',
    });
    setViewUser(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      await updateUser(formData.id, {
        fullName: formData.fullName, phone: formData.phone, city: formData.city,
        responsibility: formData.responsibility,
        ...(formData.password ? { passwordHash: formData.password } : {}),
      });
      setShowModal(false);
      await loadUsers();
    } else {
      if (!formData.email || !formData.password) {
        pushToast('warning', 'Email and password are required.');
        return;
      }
      const result = await registerUser(formData.email, formData.password, formData.responsibility, currentUser?.id);
      if (result.success) {
        setShowModal(false);
        await loadUsers();
      } else {
        pushToast('error', result.message || 'Could not create user.');
      }
    }
  };

  return (
    <PageShell
      title="All Users"
      subtitle={currentRole === Role.CITY_ADMIN ? 'Travelers under your jurisdiction' : 'Every registered traveler in the system'}
      onBack={onBack}
      accent="blue"
      actions={<BtnPrimary onClick={openCreateModal}><UserPlus size={18} /> Add User</BtnPrimary>}
    >
      <SectionCard noPadding>
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search name, email, city..." icon={Search} />
        </div>

        <div className="p-4">
          {loading && <p className="text-center text-slate-500 py-12 text-sm">Loading users...</p>}

          {!loading && listUsers.length === 0 && (
            <EmptyState icon={User} title="No users found" description="Try a different search or create a new user." action={<BtnPrimary onClick={openCreateModal}><UserPlus size={16} /> Add User</BtnPrimary>} />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {!loading && listUsers.map((user) => (
              <EntityCard
                key={user.id}
                onClick={() => setViewUser(user)}
                avatar={
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
                    {user.photoUrl ? <img src={user.photoUrl} className="w-full h-full object-cover" alt="" /> : <User size={20} className="text-slate-400" />}
                  </div>
                }
                title={user.fullName || 'No Name'}
                subtitle={user.email}
                badges={
                  <>
                    <StatusBadge label={user.status || 'ACTIVE'} variant={user.status === 'ACTIVE' ? 'success' : 'warning'} />
                    {user.isTransferred && <StatusBadge label="Transferred" variant="warning" />}
                  </>
                }
                meta={
                  <>
                    <span className="flex items-center gap-1"><MapPin size={11} /> {user.city || 'No city'}</span>
                    <span className="flex items-center gap-1"><Briefcase size={11} /> {user.responsibility || '—'}</span>
                  </>
                }
                actions={
                  <>
                    <IconBtn title="View" onClick={() => setViewUser(user)}><Eye size={16} /></IconBtn>
                    {!user.isTransferred && (
                      <IconBtn variant="primary" title="Edit" onClick={() => openEditModal(user)}><Edit size={16} /></IconBtn>
                    )}
                  </>
                }
              />
            ))}
          </div>
        </div>

        <TablePagination pagination={pagination} onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />
      </SectionCard>

      {/* View User Modal */}
      <Modal
        open={!!viewUser}
        onClose={() => setViewUser(null)}
        title={viewUser?.fullName || 'User Details'}
        subtitle={viewUser?.email}
        size="md"
        footer={
          viewUser && !viewUser.isTransferred ? (
            <div className="flex flex-wrap gap-2 justify-end">
              {currentRole === Role.CITY_ADMIN && (
                <BtnPrimary variant="indigo" onClick={() => { setTransferUser(viewUser); setViewUser(null); }}>
                  <ArrowRightLeft size={16} /> Transfer
                </BtnPrimary>
              )}
              <BtnPrimary onClick={() => openEditModal(viewUser)}><Edit size={16} /> Edit</BtnPrimary>
              <button onClick={() => viewUser && handleDelete(viewUser)} className="px-4 py-2 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 border border-red-200">
                <Trash2 size={16} className="inline mr-1" /> Delete
              </button>
            </div>
          ) : viewUser?.isTransferred ? (
            <p className="text-sm text-slate-500 flex items-center gap-2"><Lock size={14} /> View only — transferred user</p>
          ) : undefined
        }
      >
        {viewUser && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-xs text-slate-400 font-bold uppercase mb-1">Phone</p><p className="font-medium text-slate-800">{viewUser.phone || '—'}</p></div>
            <div><p className="text-xs text-slate-400 font-bold uppercase mb-1">City</p><p className="font-medium text-slate-800">{viewUser.city || '—'}</p></div>
            <div><p className="text-xs text-slate-400 font-bold uppercase mb-1">Responsibility</p><p className="font-medium text-slate-800">{viewUser.responsibility || '—'}</p></div>
            <div><p className="text-xs text-slate-400 font-bold uppercase mb-1">Joined</p><p className="font-medium text-slate-800">{viewUser.createdAt ? new Date(viewUser.createdAt).toLocaleDateString() : '—'}</p></div>
          </div>
        )}
      </Modal>

      {/* Transfer Modal */}
      <Modal open={!!transferUser} onClose={() => setTransferUser(null)} title="Transfer User" subtitle={`Reassign ${transferUser?.fullName} to another admin`} size="sm">
        <FormField label="Target Administrator">
          <select className="pbms-input" value={targetAdminId} onChange={(e) => setTargetAdminId(e.target.value)}>
            <option value="">Select...</option>
            {admins.filter((a) => a.role === Role.CITY_ADMIN && a.id !== currentUser?.id).map((admin) => (
              <option key={admin.id} value={admin.id}>{admin.name} ({admin.assignedCity})</option>
            ))}
          </select>
        </FormField>
        <BtnPrimary className="w-full mt-4" variant="indigo" onClick={handleTransfer} disabled={!targetAdminId}>
          <Check size={16} /> Confirm Transfer
        </BtnPrimary>
      </Modal>

      {/* Create / Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={isEditing ? 'Edit User' : 'Create User'}
        subtitle={isEditing ? 'Update traveler account details' : 'New traveler account'}
        size="md"
        footer={
          <button type="submit" form="user-form" className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
            {isEditing ? <><Save size={16} /> Save Changes</> : <><UserPlus size={16} /> Create User</>}
          </button>
        }
      >
        <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
          {isEditing && (
            <FormField label="Full Name">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input className="pbms-input pl-10" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
              </div>
            </FormField>
          )}
          <FormField label="Email">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input required type="email" readOnly={isEditing} className={`pbms-input pl-10 ${isEditing ? 'opacity-60' : ''}`} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
          </FormField>
          <FormField label="Password" hint={isEditing ? 'Leave blank to keep current' : undefined}>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input required={!isEditing} type="password" className="pbms-input pl-10" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
            </div>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Phone">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input className="pbms-input pl-10" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
            </FormField>
            <FormField label="City">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input className="pbms-input pl-10" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
              </div>
            </FormField>
          </div>
          <FormField label="Responsibility">
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input className="pbms-input pl-10" value={formData.responsibility} onChange={(e) => setFormData({ ...formData, responsibility: e.target.value })} placeholder="Truck driver, coordinator..." />
            </div>
          </FormField>
        </form>
      </Modal>
      {ConfirmDialog}
    </PageShell>
  );
};
