
import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../services/mockStore';
import { Role, UserEntry } from '../types';
import { getScopedEntries } from '../utils/scopeData';
import { useAppNavigation, AppView } from '../context/AppNavigationContext';
import { LayoutDashboard, Users, LogOut, ChevronRight, MessageSquare, Bell, Map, X, Truck, Navigation, Activity, Signal, Battery, UserCircle, Settings, FileBarChart, Video, Camera, Radio, AlertTriangle, PlusCircle, Shield, Ban, CheckCircle, QrCode, Megaphone } from 'lucide-react';
import { MessagingPanel } from './MessagingPanel';
import { MilitaryRadio } from './MilitaryRadio';
import { api } from '../services/api';

// --- Global Tracking Modal ---
const GlobalTrackingModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadGps = async () => {
      try {
        const { vehicles: v } = await api.getActiveGps();
        setVehicles(
          (v as any[]).map((item) => ({
            id: item.entryId,
            fullName: item.fullName,
            vehicle: item.vehicle || { registrationNumber: 'N/A', type: 'Vehicle' },
            originCity: item.originCity,
            destinationCity: item.destinationCity,
            gps: {
              ...item.gps,
              batteryLevel: item.gps?.batteryLevel ?? 85,
              signalStrength: item.gps?.signalStrength ?? 'GOOD',
            },
          }))
        );
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
        loadGps();
        const interval = setInterval(loadGps, 15000);
        return () => clearInterval(interval);
    }, []);

    const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
    const focusVehicle = selectedVehicleId ? vehicles.find(v => v.id === selectedVehicleId) : (vehicles.length > 0 ? vehicles[0] : null);

    return (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[9999] flex flex-col animate-in fade-in duration-300">
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 border-b border-slate-700 flex justify-between items-center shadow-lg z-10">
                <div className="flex items-center gap-4">
                     <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/20">
                        <Map size={24} className="text-white" />
                     </div>
                     <div>
                        <h3 className="font-bold text-lg leading-none">Live Fleet Tracking</h3>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                           <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                           <span>{vehicles.length} Active Vehicles Monitored</span>
                        </p>
                     </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                    <X size={24} />
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar List */}
                <div className="w-80 bg-slate-900 border-r border-slate-800 overflow-y-auto hidden md:block">
                    <div className="p-4">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Active Fleet</h4>
                        <div className="space-y-2">
                            {vehicles.map(v => (
                                <div 
                                    key={v.id}
                                    onClick={() => setSelectedVehicleId(v.id)}
                                    className={`p-3 rounded-xl cursor-pointer border transition-all ${selectedVehicleId === v.id || (!selectedVehicleId && v === focusVehicle) ? 'bg-slate-800 border-blue-500/50 shadow-md' : 'bg-slate-800/30 border-slate-800 hover:border-slate-700'}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-slate-200 text-sm">{v.vehicle.registrationNumber}</span>
                                        <span className={`text-[10px] px-1.5 rounded font-bold ${v.gps.speed > 0 ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                            {v.gps.speed > 5 ? 'MOVING' : 'IDLE'}
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-400 mb-2 truncate">{v.fullName}</div>
                                    <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                                        <span className="flex items-center gap-1"><Navigation size={10} /> {v.gps.speed.toFixed(0)} km/h</span>
                                        <span className="flex items-center gap-1"><Battery size={10} /> {v.gps.batteryLevel}%</span>
                                    </div>
                                </div>
                            ))}
                            {vehicles.length === 0 && (
                                <div className="text-center p-8 text-slate-500 text-sm">
                                    No active vehicles found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Map Area */}
                <div className="flex-1 relative bg-slate-950 overflow-hidden">
                    {/* Map Background */}
                    <div 
                        className="absolute inset-0 opacity-30 grayscale hover:grayscale-0 transition-all duration-1000"
                        style={{ 
                            backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/2000px-World_map_blank_without_borders.svg.png')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    ></div>
                    
                    {/* Grid Overlay */}
                    <div className="absolute inset-0 pointer-events-none" style={{ 
                        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)', 
                        backgroundSize: '50px 50px' 
                    }}></div>

                    {/* Render All Vehicles */}
                    {vehicles.map((v, idx) => {
                         // Simple scatter for demo based on index to prevent overlap if mock coords are same
                         const isSelected = selectedVehicleId === v.id || (!selectedVehicleId && idx === 0);
                         const offsetX = (idx * 50) % 300; 
                         const offsetY = (idx * 30) % 200;
                         
                         return (
                            <div 
                                key={v.id}
                                className={`absolute transition-all duration-1000 ease-linear cursor-pointer group`}
                                style={{ 
                                    top: `calc(50% + ${offsetY - 100}px)`, 
                                    left: `calc(50% + ${offsetX - 150}px)`,
                                    zIndex: isSelected ? 20 : 10
                                }}
                                onClick={() => setSelectedVehicleId(v.id)}
                            >
                                <div className="relative">
                                    {isSelected && <div className="absolute -inset-8 bg-blue-500/20 rounded-full animate-ping pointer-events-none"></div>}
                                    
                                    {/* Tooltip */}
                                    <div className={`absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded border border-slate-700 whitespace-nowrap z-30 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                                        <span className="font-bold">{v.vehicle.registrationNumber}</span>
                                        <span className="ml-2 opacity-70">{v.gps.speed.toFixed(0)} km/h</span>
                                    </div>

                                    <div 
                                        className={`w-8 h-8 rounded-full border-2 shadow-xl flex items-center justify-center transform transition-transform duration-1000 ${isSelected ? 'bg-blue-600 border-white scale-125' : 'bg-slate-700 border-slate-500 hover:bg-slate-600'}`}
                                        style={{ transform: `rotate(${v.gps.heading}deg)` }}
                                    >
                                        <Navigation size={14} className="text-white" fill="white" />
                                    </div>
                                </div>
                            </div>
                         );
                    })}

                    {/* Active Vehicle Stats Overlay */}
                    {focusVehicle && (
                        <div className="absolute bottom-6 left-6 right-6 md:right-auto md:w-80 bg-slate-900/90 backdrop-blur border border-slate-700 p-5 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4">
                            <div className="flex justify-between items-start mb-4 border-b border-slate-800 pb-3">
                                <div>
                                    <h3 className="text-white font-bold text-lg">{focusVehicle.fullName}</h3>
                                    <p className="text-slate-400 text-xs flex items-center gap-1">
                                        <Truck size={12} /> {focusVehicle.vehicleModel || focusVehicle.vehicle.type}
                                    </p>
                                </div>
                                <div className="text-right">
                                     <div className="font-mono text-xl font-bold text-blue-400">{focusVehicle.gps.speed.toFixed(0)} <span className="text-xs text-slate-500 font-sans">km/h</span></div>
                                     <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Speed</div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-3">
                                <div className="bg-slate-800/50 p-2 rounded-lg">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Origin</span>
                                    <span className="text-sm text-slate-200 font-medium truncate block">{focusVehicle.originCity}</span>
                                </div>
                                <div className="bg-slate-800/50 p-2 rounded-lg">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Destination</span>
                                    <span className="text-sm text-slate-200 font-medium truncate block">{focusVehicle.destinationCity}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                                <div className="flex items-center gap-1.5"><Activity size={12} className="text-green-500" /> GPS Active</div>
                                <div className="flex items-center gap-1.5"><Signal size={12} className="text-blue-500" /> {focusVehicle.gps.signalStrength}</div>
                                <div className="flex items-center gap-1.5"><Battery size={12} /> {focusVehicle.gps.batteryLevel}%</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentRole, notifications, logoutUser, currentUser, humanMessages, emergencyAlerts, resolveEmergency, entries, users, admins } = useStore();
  const { view, setView, setUserSection, userSection } = useAppNavigation();
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isRadioOpen, setIsRadioOpen] = useState(false);

  const scopedEntries = useMemo(
    () => getScopedEntries(entries, users, currentRole, currentUser, undefined, admins),
    [entries, users, currentRole, currentUser, admins]
  );

  const displayName = currentUser
    ? ('fullName' in currentUser ? currentUser.fullName : currentUser.name)
    : '';

  const roleLabel =
    currentRole === Role.USER
      ? 'Traveler'
      : currentRole === Role.BORDER_OFFICER
        ? `Border Officer${(currentUser as any)?.city ? ` · ${(currentUser as any).city}` : ''}`
      : currentRole === Role.CITY_ADMIN
        ? `City Admin${(currentUser as any)?.assignedCity ? ` · ${(currentUser as any).assignedCity}` : ''}`
        : 'Super Admin';

  type NavItem = { id: AppView | 'user-dashboard' | 'user-new' | 'user-profile' | 'user-settings' | 'user-incident'; label: string; icon: React.ElementType };

  const menuItems: NavItem[] = useMemo(() => {
    if (currentRole === Role.USER) {
      return [
        { id: 'user-dashboard', label: 'My Dashboard', icon: LayoutDashboard },
        { id: 'user-new', label: 'New Application', icon: PlusCircle },
        { id: 'user-incident', label: 'Report Incident', icon: AlertTriangle },
        { id: 'user-profile', label: 'Profile', icon: UserCircle },
        { id: 'user-settings', label: 'Settings', icon: Settings },
      ];
    }
    if (currentRole === Role.BORDER_OFFICER) {
      return [
        { id: 'DASHBOARD', label: 'Register Entry', icon: PlusCircle },
        { id: 'QR_VERIFY', label: 'QR Verify', icon: QrCode },
        { id: 'INCIDENTS', label: 'Incidents', icon: AlertTriangle },
        { id: 'PROFILE', label: 'Profile', icon: UserCircle },
      ];
    }
    if (currentRole === Role.CITY_ADMIN) {
      return [
        { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'USER_MANAGEMENT', label: 'My Users', icon: Users },
        { id: 'TRIPS', label: 'Transit Tracking', icon: Navigation },
        { id: 'QR_VERIFY', label: 'QR Verify', icon: QrCode },
        { id: 'INCIDENTS', label: 'Incidents', icon: AlertTriangle },
        { id: 'BROADCASTS', label: 'Broadcasts', icon: Megaphone },
        { id: 'CCTV', label: 'CCTV Monitoring', icon: Video },
        { id: 'REPORTING', label: 'Reports', icon: FileBarChart },
        { id: 'PROFILE', label: 'Profile', icon: UserCircle },
        { id: 'SETTINGS', label: 'Settings', icon: Settings },
      ];
    }
    return [
      { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'ADMIN_MANAGEMENT', label: 'City Admins', icon: Shield },
      { id: 'USER_MANAGEMENT', label: 'All Users', icon: Users },
      { id: 'BLACKLIST_MANAGEMENT', label: 'Blacklist', icon: Ban },
      { id: 'TRIPS', label: 'Transit Tracking', icon: Navigation },
      { id: 'QR_VERIFY', label: 'QR Verify', icon: QrCode },
      { id: 'INCIDENTS', label: 'Incidents', icon: AlertTriangle },
      { id: 'BROADCASTS', label: 'Broadcasts', icon: Megaphone },
      { id: 'CCTV', label: 'Surveillance', icon: Camera },
      { id: 'REPORTING', label: 'Reporting', icon: FileBarChart },
      { id: 'ZOOM', label: 'Secure Meeting', icon: Video },
      { id: 'RADIO', label: 'Military Radio', icon: Radio },
      { id: 'PROFILE', label: 'Profile', icon: UserCircle },
      { id: 'SETTINGS', label: 'Settings', icon: Settings },
    ];
  }, [currentRole]);

  const handleNavClick = (id: NavItem['id']) => {
    if (id === 'user-dashboard') {
      setView('DASHBOARD');
      setUserSection('dashboard');
      return;
    }
    if (id === 'user-new') {
      setView('DASHBOARD');
      setUserSection('selection');
      return;
    }
    if (id === 'user-profile') {
      setView('DASHBOARD');
      setUserSection('profile');
      return;
    }
    if (id === 'user-settings') {
      setView('DASHBOARD');
      setUserSection('settings');
      return;
    }
    if (id === 'user-incident') {
      setView('DASHBOARD');
      setUserSection('incident');
      return;
    }
    if (id === 'RADIO') {
      setIsRadioOpen(true);
      return;
    }
    if (id === 'ZOOM') {
      setView('ZOOM');
      return;
    }
    setView(id as AppView);
  };

  const isNavActive = (id: NavItem['id']) => {
    if (id === 'user-dashboard') return view === 'DASHBOARD' && userSection === 'dashboard';
    if (id === 'user-new') return view === 'DASHBOARD' && userSection === 'selection';
    if (id === 'user-profile') return view === 'DASHBOARD' && userSection === 'profile';
    if (id === 'user-settings') return view === 'DASHBOARD' && userSection === 'settings';
    if (id === 'user-incident') return view === 'DASHBOARD' && userSection === 'incident';
    return view === id;
  };

  // Active Emergency Alerts Logic
  const activeAlerts = emergencyAlerts.filter(a => a.status === 'ACTIVE');
  const hasEmergency = activeAlerts.length > 0 && (currentRole === Role.CITY_ADMIN || currentRole === Role.SUPER_ADMIN);

  // --- ALARM EFFECT ---
  useEffect(() => {
      if (hasEmergency) {
          const playAlarm = async () => {
              try {
                  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                  const ctx = new AudioContext();
                  
                  // Resume context if suspended (browser policy)
                  if (ctx.state === 'suspended') {
                      await ctx.resume();
                  }

                  const osc = ctx.createOscillator();
                  const gain = ctx.createGain();

                  osc.connect(gain);
                  gain.connect(ctx.destination);

                  // Alarm Tone Configuration
                  osc.type = 'sawtooth';
                  gain.gain.value = 0.15; // Set volume

                  const now = ctx.currentTime;
                  osc.start(now);

                  // Siren pattern (High-Low-High-Low) for 5 seconds
                  for(let i = 0; i < 10; i++) {
                      // High pitch
                      osc.frequency.setValueAtTime(880, now + (i * 0.5));
                      // Ramp down to low pitch
                      osc.frequency.linearRampToValueAtTime(440, now + (i * 0.5) + 0.5);
                  }

                  // Stop after 5 seconds
                  osc.stop(now + 5);
                  
                  // Cleanup context
                  setTimeout(() => {
                      if(ctx.state !== 'closed') ctx.close();
                  }, 5500);

              } catch (e) {
                  console.error("Audio alarm failed", e);
              }
          };
          
          playAlarm();
      }
  }, [hasEmergency]);

  // Calculate unread messages count
  const unreadMessagesCount = React.useMemo(() => {
     if (!currentUser) return 0;
     if (currentRole === Role.USER) {
         // Count messages from ADMIN that are unread
         return humanMessages.filter(m => m.receiverId === currentUser.id && !m.read).length;
     } else {
         // Admin: Count messages sent to ADMIN that are unread
         return humanMessages.filter(m => m.receiverId === 'ADMIN' && !m.read).length;
     }
  }, [humanMessages, currentUser, currentRole]);

  const handleSignOut = () => {
    setView('LOGIN');
    setUserSection('dashboard');
    logoutUser();
  };

  return (
    <div className="min-h-screen flex vivid-app-bg font-sans">
      {/* Sidebar */}
      <aside className="w-[280px] vivid-sidebar text-white flex-shrink-0 hidden md:flex flex-col relative z-30">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-2xl bg-white shadow-lg ring-4 ring-amber-400/30">
                <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/4/4c/Flag_of_Puntland.svg" 
                    alt="Puntland Flag" 
                    className="h-10 w-auto object-contain" 
                />
            </div>
            <div>
                <span className="block font-black text-lg leading-tight tracking-tight">Puntland BMS</span>
                <span className="text-[10px] text-cyan-200 uppercase tracking-[0.2em] font-extrabold">Border Control</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="px-2 mb-3 text-[10px] font-extrabold text-fuchsia-200 uppercase tracking-[0.2em]">Menu</div>
          {menuItems.map((item, idx) => {
            const active = isNavActive(item.id);
            const navColors = ['#8b5cf6', '#06b6d4', '#f97316', '#10b981', '#f43f5e', '#e879f9', '#fbbf24', '#6366f1'];
            const accent = navColors[idx % navColors.length];
            return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`group flex items-center gap-3 w-full px-4 py-3 rounded-2xl transition-all duration-200 ${
                active ? 'vivid-nav-active text-white' : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <div
                className="p-2 rounded-xl transition-all"
                style={active ? { background: accent, boxShadow: `0 4px 14px ${accent}66` } : { background: 'rgb(255 255 255 / 0.08)' }}
              >
                <item.icon size={18} />
              </div>
              <span className="font-bold text-sm">{item.label}</span>
              {active && <div className="ml-auto w-2 h-2 rounded-full animate-pulse" style={{ background: accent }} />}
            </button>
          );})}
        </nav>

        <div className="px-4 pb-2">
          <div className="rounded-2xl p-4 border-2 border-white/20 bg-white/10 backdrop-blur-sm">
            <p className="text-[10px] text-cyan-200 uppercase tracking-wider font-extrabold mb-1">Signed in</p>
            <p className="text-sm font-extrabold text-white truncate">{displayName}</p>
            <p className="text-xs text-fuchsia-200 mt-0.5 font-semibold">{roleLabel}</p>
          </div>
        </div>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 text-rose-200 hover:text-white transition-colors w-full text-left px-4 py-3 hover:bg-rose-500/20 rounded-2xl group font-bold text-sm"
          >
            <LogOut size={18} className="group-hover:scale-110 transition-transform" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* EMERGENCY BANNER FOR ADMINS */}
        {hasEmergency && (
            <div className="bg-red-600 text-white px-6 py-3 shadow-lg z-50 flex items-center justify-between animate-in slide-in-from-top-full duration-500">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/20 rounded-full animate-pulse">
                        <AlertTriangle size={24} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg leading-none uppercase tracking-wide">Emergency Alert Active</h3>
                        <p className="text-xs text-red-100 mt-1">
                            SOS Signal received from <span className="font-bold">{activeAlerts[0].userName}</span> at <span className="font-bold underline">{activeAlerts[0].location}</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-xs font-mono bg-red-800/50 px-2 py-1 rounded">
                        {new Date(activeAlerts[0].timestamp).toLocaleTimeString()}
                    </div>
                    <button 
                        onClick={() => resolveEmergency(activeAlerts[0].id)}
                        className="bg-white text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-bold text-sm shadow-md transition-colors flex items-center gap-2"
                    >
                        <CheckCircle size={16} /> Acknowledge & Resolve
                    </button>
                </div>
            </div>
        )}

        {/* Background - removed dull pattern */}

        {/* Header */}
        <header className="pbms-glass px-6 py-4 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-3 md:hidden">
                 <div className="p-1 rounded-xl shadow-md ring-2 ring-violet-300 bg-white">
                     <img src="https://upload.wikimedia.org/wikipedia/commons/4/4c/Flag_of_Puntland.svg" alt="PBMS" className="h-8 w-auto rounded-lg" />
                 </div>
                 <span className="font-black text-violet-800">PBMS</span>
            </div>
            
            <div className="hidden md:block">
                <h1 className="text-xl font-black bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
                  {currentRole === Role.USER ? 'Traveler Portal' : currentRole === Role.CITY_ADMIN ? 'City Command' : 'National Command'}
                </h1>
                <p className="text-xs font-bold text-violet-400">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
            </div>

            <div className="flex items-center gap-3 md:gap-6">
              
              {/* MILITARY RADIO BUTTON */}
              {currentRole !== Role.USER && (
                  <div className="relative group cursor-pointer" onClick={() => setIsRadioOpen(true)}>
                     <div className="absolute -inset-2 bg-slate-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <div className="relative">
                        <button className="text-slate-500 group-hover:text-green-600 transition-colors p-1" title="Military Radio Channel">
                            <Radio className="w-6 h-6" />
                        </button>
                     </div>
                  </div>
              )}

              {/* GPS TRACKING BUTTON - users see own vehicles, admins see scoped fleet */}
              {(currentRole === Role.USER || scopedEntries.some(e => e.entryType === 'DRIVER' && e.status === 'APPROVED')) && (
              <div className="relative group cursor-pointer" onClick={() => setIsTrackingOpen(true)}>
                 <div className="absolute -inset-2 bg-slate-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <div className="relative">
                    <button className="text-slate-500 group-hover:text-blue-600 transition-colors p-1" title="Global GPS Tracking">
                        <Map className="w-6 h-6" />
                    </button>
                    {/* Pulsing indicator if there are active drivers */}
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                    </span>
                 </div>
              </div>
              )}
              <div className="relative group cursor-pointer" onClick={() => setIsMessagingOpen(true)}>
                 <div className="absolute -inset-2 bg-slate-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <div className="relative">
                    {unreadMessagesCount > 0 && (
                        <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full absolute -top-2 -right-2 shadow-sm ring-2 ring-white animate-pulse">
                            {unreadMessagesCount}
                        </span>
                    )}
                    <button className="text-slate-500 group-hover:text-indigo-600 transition-colors p-1" title="Messages">
                        <MessageSquare className="w-6 h-6" />
                    </button>
                 </div>
              </div>

              {/* NOTIFICATION BELL */}
              <div className="relative group cursor-pointer">
                <div className="absolute -inset-2 bg-slate-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                    {notifications.filter(n => !n.read).length > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full absolute -top-1.5 -right-1.5 shadow-sm ring-2 ring-white">
                        {notifications.filter(n => !n.read).length}
                        </span>
                    )}
                    <button className="text-slate-500 group-hover:text-slate-700 transition-colors p-1" title="System Notifications">
                        <Bell className="w-6 h-6" />
                    </button>
                </div>
              </div>

              <div className="h-10 w-10 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg ring-2 ring-violet-200 cursor-pointer hover:ring-fuchsia-300 transition-all">
                {(currentUser as any)?.photoUrl ? (
                    <img src={(currentUser as any).photoUrl} alt="User" className="h-full w-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-extrabold text-sm" style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}>
                        {currentRole.charAt(0)}
                    </div>
                )}
              </div>
            </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8 relative z-10 scroll-smooth">
          {children}
        </div>
      </main>

      {/* Military Radio Modal */}
      {isRadioOpen && (
          <MilitaryRadio onClose={() => setIsRadioOpen(false)} />
      )}

      {/* Global Tracking Modal */}
      {isTrackingOpen && (
          <GlobalTrackingModal onClose={() => setIsTrackingOpen(false)} />
      )}

      {/* Messaging Side Panel */}
      <MessagingPanel isOpen={isMessagingOpen} onClose={() => setIsMessagingOpen(false)} />
    </div>
  );
};
