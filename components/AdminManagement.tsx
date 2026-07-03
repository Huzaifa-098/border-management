
import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../services/mockStore';
import { api, defaultPagination } from '../services/api';
import { AdminUser, Role, UserEntry } from '../types';
import { Trash2, UserPlus, Shield, Mail, Lock, Phone, Briefcase, RefreshCw, X, Check, Activity, Clock, FileText, Ban, Power, Edit, Eye } from 'lucide-react';
import { createPortal } from 'react-dom';
import { PageShell, SectionCard, BtnPrimary, TablePagination, Modal, FormField, EntityCard, IconBtn, StatusBadge, EmptyState, useConfirm } from './ui';
import { pushToast } from '../services/feedbackStore';

interface AdminManagementProps {
    onBack?: () => void;
}

const AdminDetailModal: React.FC<{ admin: AdminUser; onClose: () => void; onUpdated: () => void }> = ({ admin, onClose, onUpdated }) => {
    const { toggleAdminStatus, entries, resetAdminPassword } = useStore();
    const { confirm, ConfirmDialog } = useConfirm();
    const [localAdmin, setLocalAdmin] = useState(admin);

    useEffect(() => {
        setLocalAdmin(admin);
    }, [admin]);
    
    // Calculate stats/tasks
    const relevantEntries = entries.filter(e => {
        const isCityMatch = e.originCity.toLowerCase() === localAdmin.assignedCity?.toLowerCase() || 
                            e.destinationCity.toLowerCase() === localAdmin.assignedCity?.toLowerCase();
        const hasActed = e.auditHistory?.some(log => log.actorName === localAdmin.name);
        return isCityMatch || hasActed;
    });

    const pendingTasks = relevantEntries.filter(e => e.status === 'PENDING_CITY' && e.originCity.toLowerCase() === localAdmin.assignedCity?.toLowerCase()).length;
    const actionsTaken = relevantEntries.reduce((acc, entry) => {
        return acc + (entry.auditHistory?.filter(log => log.actorName === localAdmin.name).length || 0);
    }, 0);

    const handleToggleStatus = async () => {
        const newStatus = localAdmin.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        const ok = await confirm({
            title: newStatus === 'INACTIVE' ? 'Deactivate Administrator?' : 'Activate Administrator?',
            message: `Are you sure you want to ${newStatus === 'INACTIVE' ? 'deactivate' : 'activate'} "${localAdmin.name}"?`,
            confirmLabel: newStatus === 'INACTIVE' ? 'Yes, Deactivate' : 'Yes, Activate',
            cancelLabel: 'No, Cancel',
        });
        if (!ok) return;
        try {
            await toggleAdminStatus(localAdmin.id, newStatus);
            setLocalAdmin((prev) => ({ ...prev, status: newStatus }));
            onUpdated();
        } catch {
            /* API layer shows error toast */
        }
    };

    const handleResetPassword = async () => {
        const newPass = prompt(`Enter new password for ${localAdmin.name}:`);
        if (!newPass?.trim()) return;
        try {
            await resetAdminPassword(localAdmin.id, newPass);
        } catch {
            /* API layer shows error toast */
        }
    };

    return (
        <>
        {createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
                 <div className="h-32 bg-gradient-to-r from-slate-800 to-slate-900 relative shrink-0">
                     <button onClick={onClose} className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors">
                         <X size={20} />
                     </button>
                     <div className="absolute -bottom-10 left-8">
                         <div className="h-24 w-24 rounded-2xl bg-white p-1.5 shadow-lg">
                             <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden">
                                {localAdmin.photoUrl ? (
                                    <img src={localAdmin.photoUrl} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <Shield size={40} className="text-slate-400" />
                                )}
                             </div>
                         </div>
                     </div>
                 </div>

                 <div className="pt-14 px-8 pb-8 overflow-y-auto">
                     <div className="flex justify-between items-start mb-6">
                         <div>
                             <h2 className="text-2xl font-bold text-slate-900">{localAdmin.name}</h2>
                             <p className="text-slate-500 font-medium">{localAdmin.responsibility || 'City Administrator'}</p>
                             <div className="flex items-center gap-2 mt-2">
                                 <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 font-bold">{localAdmin.assignedCity}</span>
                                 <span className={`text-xs px-2 py-0.5 rounded border font-bold ${localAdmin.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                     {localAdmin.status || 'ACTIVE'}
                                 </span>
                             </div>
                         </div>
                         <div className="flex gap-2">
                             <button onClick={handleResetPassword} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200" title="Reset Password">
                                 <RefreshCw size={20} />
                             </button>
                             <button 
                                onClick={handleToggleStatus}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors border ${localAdmin.status === 'ACTIVE' ? 'bg-white text-red-600 border-red-200 hover:bg-red-50' : 'bg-green-600 text-white border-green-600 hover:bg-green-700'}`}
                             >
                                 <Power size={18} /> {localAdmin.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                             </button>
                         </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                         <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Contact Info</h4>
                             <div className="flex items-center gap-3 text-sm">
                                 <div className="bg-white p-2 rounded text-slate-500 shadow-sm"><Mail size={16} /></div>
                                 <span className="text-slate-700 font-medium">{localAdmin.email}</span>
                             </div>
                             <div className="flex items-center gap-3 text-sm">
                                 <div className="bg-white p-2 rounded text-slate-500 shadow-sm"><Phone size={16} /></div>
                                 <span className="text-slate-700 font-medium">{localAdmin.phone || 'N/A'}</span>
                             </div>
                         </div>
                         <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Performance</h4>
                             <div className="flex items-center justify-between">
                                 <span className="text-sm text-slate-600 flex items-center gap-2"><Activity size={16} /> Actions Logged</span>
                                 <span className="font-mono font-bold text-slate-800 text-lg">{actionsTaken}</span>
                             </div>
                             <div className="flex items-center justify-between">
                                 <span className="text-sm text-slate-600 flex items-center gap-2"><Clock size={16} /> Pending Queue</span>
                                 <span className="font-mono font-bold text-orange-600 text-lg">{pendingTasks}</span>
                             </div>
                         </div>
                     </div>

                     <div>
                         <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                             <FileText size={18} className="text-blue-500" /> Recent Activity Log
                         </h4>
                         <div className="space-y-3">
                             {relevantEntries.length > 0 ? (
                                 relevantEntries.slice(0, 5).map(entry => {
                                     const myAction = entry.auditHistory?.find(log => log.actorName === localAdmin.name);
                                     if (!myAction && entry.status !== 'PENDING_CITY') return null; // Only show if acted upon or pending in their queue

                                     return (
                                         <div key={entry.id} className="flex items-start gap-3 p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                                             <div className="mt-1">
                                                {myAction ? <Check size={16} className="text-green-500" /> : <Clock size={16} className="text-orange-500" />}
                                             </div>
                                             <div>
                                                 <p className="text-sm font-medium text-slate-800">
                                                     {myAction ? myAction.action : 'Entry waiting for review'}
                                                 </p>
                                                 <p className="text-xs text-slate-500">
                                                     Ref: <span className="font-mono text-slate-600">#{entry.id.substring(0,8)}</span> • {entry.fullName}
                                                 </p>
                                                 {myAction && <p className="text-[10px] text-slate-400 mt-1">{new Date(myAction.timestamp).toLocaleString()}</p>}
                                             </div>
                                         </div>
                                     );
                                 })
                             ) : (
                                 <p className="text-slate-400 text-sm italic">No recent activity recorded.</p>
                             )}
                         </div>
                     </div>
                 </div>
            </div>
        </div>,
        document.body
        )}
        {ConfirmDialog}
        </>
    );
};

export const AdminManagement: React.FC<AdminManagementProps> = ({ onBack }) => {
  const { addAdmin, updateAdmin, deleteAdmin, resetAdminPassword } = useStore();
  const { confirm, ConfirmDialog } = useConfirm();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [listAdmins, setListAdmins] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState(defaultPagination);
  const [loading, setLoading] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
      phone: '',
      responsibility: '',
      assignedCity: ''
  });

  const loadAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getAdmins({ page, limit });
      setListAdmins((res.admins as AdminUser[]).filter((a) => a.role !== Role.SUPER_ADMIN));
      setPagination(res.pagination);
    } catch (e) {
      console.error('Failed to load admins:', e);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  useEffect(() => {
    if (!selectedAdmin) return;
    const fresh = listAdmins.find((a) => a.id === selectedAdmin.id);
    if (fresh) setSelectedAdmin(fresh);
  }, [listAdmins, selectedAdmin?.id]);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
        try {
          await updateAdmin(editingId, {
              name: formData.name,
              email: formData.email,
              passwordHash: formData.password || undefined,
              phone: formData.phone,
              responsibility: formData.responsibility,
              assignedCity: formData.assignedCity
          });
          setEditingId(null);
          setShowFormModal(false);
          await loadAdmins();
        } catch { /* toast via API */ }
    } else {
        if (!formData.email || !formData.password) {
            pushToast('warning', 'Email and password are required.');
            return;
        }
        try {
          await addAdmin({
              name: formData.name,
              email: formData.email,
              passwordHash: formData.password,
              phone: formData.phone,
              responsibility: formData.responsibility,
              role: Role.CITY_ADMIN,
              assignedCity: formData.assignedCity
          });
          setShowFormModal(false);
          await loadAdmins();
        } catch { /* toast via API */ }
    }
    
    // Reset form
    setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        responsibility: '',
        assignedCity: ''
    });
  };

  const handleDelete = async (id: string, name: string) => {
      const ok = await confirm({
          title: 'Delete City Admin?',
          message: `Are you sure you want to permanently delete "${name}"? This action cannot be undone.`,
          confirmLabel: 'Yes, Delete',
          cancelLabel: 'No, Cancel',
      });
      if (!ok) return;
      await deleteAdmin(id);
      if (editingId === id) {
          setEditingId(null);
          setFormData({
              name: '',
              email: '',
              password: '',
              phone: '',
              responsibility: '',
              assignedCity: ''
          });
      }
      await loadAdmins();
  };

  const openCreate = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', password: '', phone: '', responsibility: '', assignedCity: '' });
    setShowFormModal(true);
  };

  const handleEdit = (admin: AdminUser) => {
      setEditingId(admin.id);
      setFormData({
          name: admin.name,
          email: admin.email || '',
          password: '',
          phone: admin.phone || '',
          responsibility: admin.responsibility || '',
          assignedCity: admin.assignedCity || ''
      });
      setShowFormModal(true);
  };

  const handleCancelEdit = () => {
      setEditingId(null);
      setShowFormModal(false);
      setFormData({ name: '', email: '', password: '', phone: '', responsibility: '', assignedCity: '' });
  };

  return (
    <PageShell
      title="City Administrators"
      subtitle="Manage regional admins and jurisdictions"
      onBack={onBack}
      accent="indigo"
      actions={<BtnPrimary variant="indigo" onClick={openCreate}><UserPlus size={18} /> Add Admin</BtnPrimary>}
    >
        <SectionCard noPadding>
            <div className="p-4">
              {loading && <p className="text-center text-slate-500 py-12 text-sm">Loading administrators...</p>}

              {!loading && listAdmins.length === 0 && (
                <EmptyState icon={Shield} title="No city admins" description="Create your first regional administrator." action={<BtnPrimary variant="indigo" onClick={openCreate}><UserPlus size={16} /> Add Admin</BtnPrimary>} />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {!loading && listAdmins.map((admin) => (
                  <EntityCard
                    key={admin.id}
                    onClick={() => setSelectedAdmin(admin)}
                    variant={admin.status === 'INACTIVE' ? 'default' : 'highlight'}
                    avatar={
                      <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${admin.status === 'INACTIVE' ? 'bg-slate-200 text-slate-400' : 'bg-indigo-100 text-indigo-600'}`}>
                        <Shield size={20} />
                      </div>
                    }
                    title={admin.name}
                    subtitle={admin.email}
                    badges={
                      <StatusBadge label={admin.status || 'ACTIVE'} variant={admin.status === 'INACTIVE' ? 'neutral' : 'success'} />
                    }
                    meta={
                      <>
                        <span>{admin.assignedCity}</span>
                        <span>{admin.responsibility || 'General Admin'}</span>
                      </>
                    }
                    actions={
                      <>
                        <IconBtn title="View" onClick={() => setSelectedAdmin(admin)}><Eye size={16} /></IconBtn>
                        <IconBtn variant="primary" title="Edit" onClick={() => handleEdit(admin)}><Edit size={16} /></IconBtn>
                        <IconBtn variant="danger" title="Delete" onClick={() => handleDelete(admin.id, admin.name)}><Trash2 size={16} /></IconBtn>
                      </>
                    }
                  />
                ))}
              </div>
            </div>
            <TablePagination pagination={pagination} onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />
        </SectionCard>

        <Modal
          open={showFormModal}
          onClose={handleCancelEdit}
          title={editingId ? 'Edit Administrator' : 'New City Admin'}
          subtitle={editingId ? 'Update regional admin account' : 'Create a new jurisdiction admin'}
          size="md"
          footer={
            <button type="submit" form="admin-form" className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg">
              {editingId ? 'Update Admin' : 'Create Account'}
            </button>
          }
        >
          <form id="admin-form" onSubmit={handleCreateOrUpdate} className="space-y-4">
            <FormField label="Full Name">
              <input required className="pbms-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Admin Name" />
            </FormField>
            <FormField label="Assigned City">
              <input required className="pbms-input" value={formData.assignedCity} onChange={(e) => setFormData({ ...formData, assignedCity: e.target.value })} placeholder="e.g. Garowe" />
            </FormField>
            <FormField label="Responsibility">
              <input className="pbms-input" value={formData.responsibility} onChange={(e) => setFormData({ ...formData, responsibility: e.target.value })} placeholder="Regional Manager" />
            </FormField>
            <FormField label="Email (Username)">
              <input required type="email" readOnly={!!editingId} className={`pbms-input ${editingId ? 'opacity-60' : ''}`} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="admin@pbms.so" />
            </FormField>
            <FormField label="Password" hint={editingId ? 'Leave blank to keep current' : undefined}>
              <input required={!editingId} type="password" className="pbms-input" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
            </FormField>
            <FormField label="Phone">
              <input className="pbms-input" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+252..." />
            </FormField>
          </form>
        </Modal>

        {selectedAdmin && (
            <AdminDetailModal admin={selectedAdmin} onClose={() => setSelectedAdmin(null)} onUpdated={loadAdmins} />
        )}
        {ConfirmDialog}
    </PageShell>
  );
};
