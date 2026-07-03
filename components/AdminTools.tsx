
import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../services/mockStore';
import { User, Mail, Phone, MapPin, Briefcase, Shield, Save, Lock, Bell, Globe, Moon, ArrowLeft, Edit, X, Check, Camera, AlertCircle } from 'lucide-react';
import { AdminUser, Role } from '../types';

export const AdminProfile: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { currentUser, updateCurrentUserProfile } = useStore();
  const user = currentUser as AdminUser;
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
      name: '',
      phone: '',
      responsibility: '',
      assignedCity: '',
      photoUrl: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      if (user) {
          setFormData({
              name: user.name,
              phone: user.phone || '',
              responsibility: user.responsibility || '',
              assignedCity: user.assignedCity || '',
              photoUrl: user.photoUrl || ''
          });
      }
  }, [user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
      updateCurrentUserProfile({
          name: formData.name,
          phone: formData.phone,
          responsibility: formData.responsibility,
          assignedCity: user.role === Role.CITY_ADMIN ? formData.assignedCity : undefined,
          photoUrl: formData.photoUrl
      });
      setIsEditing(false);
      alert('Profile updated successfully.');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-right duration-300">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium text-sm">
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-slate-800 to-slate-900 relative">
             <div className="absolute -bottom-12 left-8">
                <div className="h-24 w-24 bg-white rounded-2xl p-1.5 shadow-lg relative group">
                    <div 
                        className={`h-full w-full bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 overflow-hidden ${isEditing ? 'cursor-pointer' : ''}`}
                        onClick={() => isEditing && fileInputRef.current?.click()}
                    >
                        {formData.photoUrl ? (
                            <img src={formData.photoUrl} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                            <User size={40} />
                        )}
                    </div>
                    {isEditing && (
                        <div 
                            className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Camera size={24} className="text-white" />
                        </div>
                    )}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                    />
                </div>
             </div>
             <div className="absolute top-4 right-4">
                 {!isEditing ? (
                     <button 
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 px-4 py-2 rounded-lg font-medium text-sm transition-colors border border-white/20"
                     >
                        <Edit size={16} /> Edit Profile
                     </button>
                 ) : (
                     <div className="flex gap-2">
                         <button 
                            onClick={() => setIsEditing(false)}
                            className="flex items-center gap-2 bg-red-500/80 backdrop-blur-md text-white hover:bg-red-600 px-3 py-2 rounded-lg font-medium text-sm transition-colors"
                         >
                            <X size={16} /> Cancel
                         </button>
                         <button 
                            onClick={handleSave}
                            className="flex items-center gap-2 bg-emerald-500/80 backdrop-blur-md text-white hover:bg-emerald-600 px-3 py-2 rounded-lg font-medium text-sm transition-colors"
                         >
                            <Check size={16} /> Save
                         </button>
                     </div>
                 )}
             </div>
        </div>
        <div className="pt-16 pb-8 px-8">
            <div className="flex justify-between items-start mb-6">
                <div className="w-full">
                    {isEditing ? (
                        <div className="mb-2">
                             <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Full Name</label>
                             <input 
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})} 
                                className="text-xl font-bold text-slate-800 border-b border-blue-500 bg-blue-50/50 w-full md:w-1/2 outline-none px-2 py-1"
                             />
                        </div>
                    ) : (
                        <h2 className="text-2xl font-bold text-slate-800">{user?.name}</h2>
                    )}
                    
                    {isEditing ? (
                        <div>
                             <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Title / Responsibility</label>
                             <input 
                                value={formData.responsibility} 
                                onChange={e => setFormData({...formData, responsibility: e.target.value})} 
                                className="text-base text-slate-600 border-b border-blue-500 bg-blue-50/50 w-full md:w-1/2 outline-none px-2 py-1"
                             />
                        </div>
                    ) : (
                        <p className="text-slate-500 font-medium">{user?.responsibility || 'Administrator'}</p>
                    )}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${user?.role === Role.SUPER_ADMIN ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>
                    {user?.role?.replace('_', ' ')}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Contact Information</h3>
                    <div className="flex items-center gap-3 text-sm">
                        <div className="bg-slate-50 p-2 rounded-lg text-slate-500"><Mail size={16} /></div>
                        <div className="w-full">
                            <span className="block text-xs text-slate-400">Email Address</span>
                            <span className="font-medium text-slate-700">{user?.email || 'N/A'}</span>
                            {isEditing && <span className="text-[10px] text-slate-400 italic ml-2">(Read-only)</span>}
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <div className="bg-slate-50 p-2 rounded-lg text-slate-500"><Phone size={16} /></div>
                        <div className="w-full">
                            <span className="block text-xs text-slate-400">Phone Number</span>
                            {isEditing ? (
                                <input 
                                    value={formData.phone} 
                                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                                    className="font-medium text-slate-700 border border-slate-200 rounded px-2 py-1 w-full outline-none focus:border-blue-500"
                                />
                            ) : (
                                <span className="font-medium text-slate-700">{user?.phone || 'N/A'}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Role Details</h3>
                    <div className="flex items-center gap-3 text-sm">
                        <div className="bg-slate-50 p-2 rounded-lg text-slate-500"><Shield size={16} /></div>
                        <div>
                            <span className="block text-xs text-slate-400">Access Level</span>
                            <span className="font-medium text-slate-700">{user?.role === Role.SUPER_ADMIN ? 'Root Access' : 'City Level Access'}</span>
                        </div>
                    </div>
                    {user?.role === Role.CITY_ADMIN && (
                        <div className="flex items-center gap-3 text-sm">
                            <div className="bg-slate-50 p-2 rounded-lg text-slate-500"><MapPin size={16} /></div>
                            <div className="w-full">
                                <span className="block text-xs text-slate-400">Assigned City</span>
                                {isEditing ? (
                                    <input 
                                        value={formData.assignedCity} 
                                        onChange={e => setFormData({...formData, assignedCity: e.target.value})} 
                                        className="font-medium text-slate-700 border border-slate-200 rounded px-2 py-1 w-full outline-none focus:border-blue-500"
                                    />
                                ) : (
                                    <span className="font-medium text-slate-700">{user?.assignedCity}</span>
                                )}
                            </div>
                        </div>
                    )}
                     <div className="flex items-center gap-3 text-sm">
                        <div className="bg-slate-50 p-2 rounded-lg text-slate-500"><Briefcase size={16} /></div>
                        <div className="w-full">
                            <span className="block text-xs text-slate-400">Responsibility</span>
                            {isEditing ? (
                                <input 
                                    value={formData.responsibility} 
                                    onChange={e => setFormData({...formData, responsibility: e.target.value})} 
                                    className="font-medium text-slate-700 border border-slate-200 rounded px-2 py-1 w-full outline-none focus:border-blue-500"
                                />
                            ) : (
                                <span className="font-medium text-slate-700">{user?.responsibility || 'General Management'}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export const AdminSettings: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { currentUser, updateCurrentUserProfile, changeCurrentUserPassword } = useStore();
  const user = currentUser as AdminUser;
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  const [preferences, setPreferences] = useState({
      emailAlerts: true,
      dailySummary: true,
      theme: 'LIGHT' as 'LIGHT' | 'DARK'
  });

  useEffect(() => {
      if (user?.preferences) {
          setPreferences(user.preferences);
      }
  }, [user]);

  const handleUpdatePassword = async () => {
      if (!currentPassword || !newPassword) {
          setPasswordMessage({ type: 'error', text: 'Please fill in both fields.' });
          return;
      }
      
      const result = await changeCurrentUserPassword(currentPassword, newPassword);
      if (result.success) {
          setPasswordMessage({ type: 'success', text: result.message });
          setCurrentPassword('');
          setNewPassword('');
          setTimeout(() => setPasswordMessage(null), 3000);
      } else {
          setPasswordMessage({ type: 'error', text: result.message });
      }
  };

  const handleSavePreferences = () => {
      updateCurrentUserProfile({ preferences: preferences });
      alert("Preferences saved successfully!");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-right duration-300">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium text-sm">
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800">System Preferences</h2>
        </div>
        
        <div className="divide-y divide-slate-100">
            {/* Account Security */}
            <div className="p-6">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Lock size={16} className="text-blue-500" /> Account Security
                </h3>
                {passwordMessage && (
                    <div className={`text-xs p-3 rounded-lg mb-4 flex items-center gap-2 ${passwordMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        <AlertCircle size={14} /> {passwordMessage.text}
                    </div>
                )}
                <div className="space-y-4 max-w-md">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Current Password</label>
                        <input 
                            type="password" 
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition-all" 
                            placeholder="••••••••" 
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">New Password</label>
                        <input 
                            type="password" 
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none transition-all" 
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={handleUpdatePassword}
                        className="text-xs bg-slate-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-700 transition-colors shadow-sm"
                    >
                        Update Password
                    </button>
                </div>
            </div>

            {/* Notifications */}
            <div className="p-6">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Bell size={16} className="text-amber-500" /> Notifications
                </h3>
                <div className="space-y-3">
                    <div 
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setPreferences(p => ({ ...p, emailAlerts: !p.emailAlerts }))}
                    >
                        <span className="text-sm text-slate-600">Email alerts for new entries</span>
                        <div className={`w-10 h-5 rounded-full relative transition-colors ${preferences.emailAlerts ? 'bg-blue-600' : 'bg-slate-200'}`}>
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${preferences.emailAlerts ? 'right-1' : 'left-1'}`}></div>
                        </div>
                    </div>
                    <div 
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setPreferences(p => ({ ...p, dailySummary: !p.dailySummary }))}
                    >
                         <span className="text-sm text-slate-600">Dashboard daily summary</span>
                         <div className={`w-10 h-5 rounded-full relative transition-colors ${preferences.dailySummary ? 'bg-blue-600' : 'bg-slate-200'}`}>
                             <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${preferences.dailySummary ? 'right-1' : 'left-1'}`}></div>
                         </div>
                    </div>
                </div>
            </div>

            {/* Appearance */}
            <div className="p-6">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Moon size={16} className="text-indigo-500" /> Appearance
                </h3>
                <div className="flex gap-4">
                    <div 
                        onClick={() => setPreferences(p => ({ ...p, theme: 'LIGHT' }))}
                        className={`border-2 p-3 rounded-xl bg-slate-50 cursor-pointer transition-all ${preferences.theme === 'LIGHT' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-transparent hover:border-slate-200'}`}
                    >
                        <div className="w-20 h-12 bg-white border border-slate-200 rounded mb-2 shadow-sm"></div>
                        <span className={`text-xs font-bold block text-center ${preferences.theme === 'LIGHT' ? 'text-blue-700' : 'text-slate-500'}`}>Light</span>
                    </div>
                    <div 
                         onClick={() => setPreferences(p => ({ ...p, theme: 'DARK' }))}
                         className={`border-2 p-3 rounded-xl bg-white cursor-pointer transition-all ${preferences.theme === 'DARK' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-transparent hover:border-slate-200'}`}
                    >
                        <div className="w-20 h-12 bg-slate-800 rounded mb-2 shadow-sm"></div>
                        <span className={`text-xs font-bold block text-center ${preferences.theme === 'DARK' ? 'text-blue-700' : 'text-slate-500'}`}>Dark</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button 
                onClick={handleSavePreferences}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm"
            >
                <Save size={16} /> Save Changes
            </button>
        </div>
      </div>
    </div>
  );
};
