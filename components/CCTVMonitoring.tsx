
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useStore } from '../services/mockStore';
import { Role } from '../types';
import { ArrowLeft, Maximize2, Video, Activity, Mic, MicOff, Signal, Minimize2, Radio, MessageSquare, Send, X, Aperture } from 'lucide-react';

// Unified interface for monitoring targets (Admins or Users)
interface MonitorTarget {
    id: string;
    name: string;
    status: string;
    label: string;
    photoUrl?: string;
    type: 'ADMIN' | 'USER';
}

// --- Extracted FeedCard Component ---
interface FeedCardProps {
    target: MonitorTarget;
    isLarge?: boolean;
    isSelected: boolean;
    onSelect: () => void;
    stats: { bitrate: number, fps: number, signal: number };
}

const FeedCard: React.FC<FeedCardProps> = ({ target, isLarge = false, isSelected, onSelect, stats }) => {
    const { humanMessages, sendHumanMessage, currentUser } = useStore();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [isAudioActive, setIsAudioActive] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const isOffline = target.status === 'INACTIVE'; 

    // Filter messages relevant to this specific channel
    const messages = humanMessages.filter(m => 
        (m.senderId === currentUser?.id && m.receiverId === target.id) ||
        (m.senderId === target.id && m.receiverId === currentUser?.id)
    ).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const unreadCount = humanMessages.filter(m => m.senderId === target.id && m.receiverId === currentUser?.id && !m.read).length;

    useEffect(() => {
        if (isChatOpen && chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isChatOpen]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        sendHumanMessage(chatInput, target.id);
        setChatInput('');
    };

    return (
      <div 
        className={`relative bg-black rounded-xl overflow-hidden border-2 group transition-all duration-300 flex flex-col ${
            isSelected 
                ? 'border-blue-500 shadow-blue-500/20 shadow-2xl ring-1 ring-blue-500/50' 
                : 'border-slate-800 hover:border-slate-600'
        } ${isLarge ? 'h-full' : 'h-64'}`}
        onClick={() => !isChatOpen && onSelect()} // Prevent selecting when interacting with chat
      >
        {/* Header Overlay */}
        <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start z-20 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
            <div className="flex items-center gap-2 pointer-events-auto">
                <div className={`w-2 h-2 rounded-full ${isOffline ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></div>
                <div>
                    <h3 className="text-white font-bold text-xs uppercase tracking-wider font-mono">
                        CAM-{target.label.substring(0,3).toUpperCase()}-{target.id.substring(0,3)}
                    </h3>
                    <p className="text-[10px] text-slate-300 font-medium">{target.name}</p>
                </div>
            </div>
            <div className="flex flex-col items-end pointer-events-auto">
                <div className="flex items-center gap-2">
                    {isAudioActive && (
                        <div className="flex gap-0.5 items-end h-3">
                            <div className="w-0.5 h-full bg-blue-400 animate-[music_0.5s_ease-in-out_infinite]"></div>
                            <div className="w-0.5 h-2/3 bg-blue-400 animate-[music_0.7s_ease-in-out_infinite]"></div>
                            <div className="w-0.5 h-full bg-blue-400 animate-[music_0.6s_ease-in-out_infinite]"></div>
                        </div>
                    )}
                    <span className="font-mono text-[10px] text-blue-400 bg-blue-900/30 px-1.5 py-0.5 rounded border border-blue-900/50">
                        {new Date().toLocaleTimeString([], { hour12: false })}
                    </span>
                </div>
                {!isOffline && (
                    <span className="text-[9px] text-slate-400 font-mono mt-1">
                        {stats.bitrate}kbps • {stats.fps}fps
                    </span>
                )}
            </div>
        </div>

        {/* Video Area */}
        <div className="flex-1 relative bg-slate-900 overflow-hidden group-hover:brightness-110 transition-all">
            {!isOffline ? (
                <>
                    <img 
                        src={`https://loremflickr.com/800/600/city,people,portrait?random=${target.id}`} 
                        alt={`CCTV ${target.name}`}
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_4px,6px_100%] pointer-events-none"></div>
                    
                    {/* Chat Overlay */}
                    {isChatOpen && (
                        <div className="absolute inset-y-0 right-0 w-72 bg-black/80 backdrop-blur-md border-l border-slate-700 z-30 flex flex-col animate-in slide-in-from-right duration-200" onClick={e => e.stopPropagation()}>
                            <div className="p-3 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
                                <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                                    <MessageSquare size={12} /> Secure Comm
                                </span>
                                <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white"><X size={14} /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                                {messages.length === 0 && (
                                    <div className="text-center text-[10px] text-slate-500 mt-4">
                                        No recent communication.
                                        <br/>Report suspicious activity here.
                                    </div>
                                )}
                                {messages.map(msg => (
                                    <div key={msg.id} className={`flex flex-col ${msg.senderId === currentUser?.id ? 'items-end' : 'items-start'}`}>
                                        <div className={`max-w-[85%] rounded-lg p-2 text-xs ${msg.senderId === currentUser?.id ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                                            {msg.content}
                                        </div>
                                        <span className="text-[9px] text-slate-500 mt-0.5">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>
                            <form onSubmit={handleSendMessage} className="p-2 border-t border-slate-700 bg-slate-900/50">
                                <div className="flex gap-2">
                                    <input 
                                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 placeholder-slate-500"
                                        placeholder="Type message..."
                                        value={chatInput}
                                        onChange={e => setChatInput(e.target.value)}
                                        autoFocus
                                    />
                                    <button type="submit" className="bg-blue-600 text-white p-1.5 rounded-lg hover:bg-blue-500 transition-colors">
                                        <Send size={14} />
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </>
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-slate-950">
                    <Video size={32} className="mb-2 opacity-20" />
                    <span className="font-mono text-xs uppercase tracking-widest text-red-900/50 animate-pulse">Signal Lost</span>
                </div>
            )}
        </div>

        {/* Footer Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between items-end z-20 bg-gradient-to-t from-black/90 to-transparent pointer-events-none">
            <div className="flex gap-2 pointer-events-auto">
                <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${!isOffline ? 'bg-red-900/40 text-red-400 border-red-900/50' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${!isOffline ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`}></div>
                    Rec
                </div>
                {!isOffline && stats.signal < 90 && (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-900/40 text-amber-400 border border-amber-900/50">
                        <Activity size={10} /> Motion
                    </div>
                )}
            </div>
            
            <div className="flex items-center gap-2 text-slate-400 pointer-events-auto">
                 {!isOffline && (
                     <>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsChatOpen(!isChatOpen);
                            }}
                            className={`p-1.5 rounded-lg transition-all relative ${
                                isChatOpen 
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50' 
                                    : 'hover:bg-slate-700 text-slate-400 hover:text-white'
                            }`}
                            title="Open Secure Chat"
                        >
                            <MessageSquare size={14} />
                            {unreadCount > 0 && !isChatOpen && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-black animate-pulse"></span>
                            )}
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsAudioActive(!isAudioActive);
                            }}
                            className={`p-1.5 rounded-lg transition-all ${
                                isAudioActive 
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/50 hover:bg-emerald-500' 
                                    : 'hover:bg-slate-700 text-slate-400 hover:text-white'
                            }`}
                            title={isAudioActive ? "Mute Live Audio" : "Listen to Live Audio"}
                        >
                            {isAudioActive ? <Mic size={14} className="animate-pulse" /> : <MicOff size={14} />}
                        </button>

                        <div className="flex items-center gap-0.5 text-[9px] font-mono">
                            <Signal size={12} className={stats.signal > 90 ? 'text-green-500' : stats.signal > 70 ? 'text-yellow-500' : 'text-red-500'} />
                            {stats.signal}%
                        </div>
                     </>
                 )}
                 <button onClick={(e) => { e.stopPropagation(); onSelect(); }} className="text-white hover:text-blue-400 transition-colors">
                    {isLarge ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                 </button>
            </div>
        </div>
      </div>
    );
};

export const CCTVMonitoring: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { admins, users, currentRole, currentUser } = useStore();
  const [selectedFeed, setSelectedFeed] = useState<string | null>(null);
  const [gridMode, setGridMode] = useState<2 | 3 | 4>(3);
  const [feedStats, setFeedStats] = useState<Record<string, { bitrate: number, fps: number, signal: number }>>({});

  // Determine targets based on Role
  const targets: MonitorTarget[] = useMemo(() => {
      if (currentRole === Role.SUPER_ADMIN) {
          return admins.filter(a => a.role === Role.CITY_ADMIN).map(a => ({
              id: a.id,
              name: a.name,
              status: a.status || 'ACTIVE',
              label: a.assignedCity || 'City Admin',
              photoUrl: a.photoUrl,
              type: 'ADMIN'
          }));
      } else if (currentRole === Role.CITY_ADMIN) {
          // City Admin monitors Users they created
          return users.filter(u => u.createdByAdminId === currentUser?.id).map(u => ({
              id: u.id,
              name: u.fullName,
              status: u.status,
              label: u.city || 'User',
              photoUrl: u.photoUrl,
              type: 'USER'
          }));
      }
      return [];
  }, [admins, users, currentRole, currentUser]);

  useEffect(() => {
    const timer = setInterval(() => {
        const newStats: any = {};
        targets.forEach(target => {
            newStats[target.id] = {
                bitrate: Math.floor(2500 + Math.random() * 1500),
                fps: Math.floor(24 + Math.random() * 6),
                signal: Math.floor(85 + Math.random() * 15)
            };
        });
        setFeedStats(newStats);
    }, 1000);
    return () => clearInterval(timer);
  }, [targets]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-10 flex flex-col animate-in fade-in duration-500">
      <style>{`
        @keyframes music {
            0%, 100% { height: 100%; }
            50% { height: 40%; }
        }
      `}</style>
      
      {/* Top Toolbar */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-30 shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 max-w-[1920px] mx-auto w-full">
            <div className="flex items-center gap-4 w-full md:w-auto">
                <button 
                    onClick={onBack} 
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2 tracking-tight">
                        <Radio className="text-red-500 animate-pulse" size={20} /> 
                        {currentRole === Role.SUPER_ADMIN ? 'NOC Surveillance Grid' : 'City Ops Monitoring'}
                    </h2>
                    <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">
                        {currentRole === Role.SUPER_ADMIN ? 'National Oversight' : `Monitoring ${targets.length} Active Targets`}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-6 w-full md:w-auto justify-end">
                {/* Stats Widget */}
                <div className="hidden md:flex gap-6 text-xs font-mono text-slate-400 bg-black/20 p-2 rounded-lg border border-slate-800">
                    <div className="flex flex-col items-center px-2 border-r border-slate-800">
                        <span className="text-slate-600 uppercase text-[9px] font-bold">Total Feeds</span>
                        <span className="text-white font-bold text-lg leading-none">{targets.length}</span>
                    </div>
                    <div className="flex flex-col items-center px-2 border-r border-slate-800">
                        <span className="text-slate-600 uppercase text-[9px] font-bold">Online</span>
                        <span className="text-emerald-400 font-bold text-lg leading-none">
                            {targets.filter(t => t.status !== 'INACTIVE').length}
                        </span>
                    </div>
                    <div className="flex flex-col items-center px-2">
                        <span className="text-slate-600 uppercase text-[9px] font-bold">Bandwidth</span>
                        <span className="text-blue-400 font-bold text-lg leading-none">~{(targets.length * 2.5).toFixed(1)} Mb/s</span>
                    </div>
                </div>

                {/* Grid Controls */}
                <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
                    {[2, 3, 4].map(num => (
                        <button
                            key={num}
                            onClick={() => { setGridMode(num as any); setSelectedFeed(null); }}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${gridMode === num && !selectedFeed ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                        >
                            {num}x{num}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="flex-1 p-6 max-w-[1920px] mx-auto w-full">
          {targets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[60vh] border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/50">
                  <div className="bg-slate-800 p-6 rounded-full mb-4 shadow-xl">
                      <Aperture size={48} className="text-slate-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-400">No Active Feeds</h3>
                  <p className="text-slate-600 mt-2 max-w-md text-center">
                      {currentRole === Role.SUPER_ADMIN 
                        ? "Create City Admin accounts to initialize camera feeds."
                        : "You haven't registered any users yet. Add users to monitor their status."}
                  </p>
              </div>
          ) : (
              <div className={`grid gap-4 transition-all duration-500 ease-in-out ${
                  selectedFeed 
                    ? 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4 h-[80vh]' // Focus Mode
                    : `grid-cols-1 md:grid-cols-${gridMode} auto-rows-fr` // Grid Mode
              }`}>
                  
                  {/* Focus Mode: Selected Feed Logic */}
                  {selectedFeed && (
                      <div className="md:col-span-2 lg:col-span-3 row-span-2 relative animate-in zoom-in-95 duration-300 h-full">
                          {targets.filter(t => t.id === selectedFeed).map(target => (
                              <FeedCard 
                                  key={target.id} 
                                  target={target} 
                                  isLarge={true}
                                  isSelected={true}
                                  onSelect={() => setSelectedFeed(null)}
                                  stats={feedStats[target.id] || { bitrate: 0, fps: 0, signal: 0 }}
                              />
                          ))}
                      </div>
                  )}

                  {/* Other Feeds */}
                  {targets
                    .filter(t => selectedFeed ? t.id !== selectedFeed : true)
                    .map(target => (
                      <div key={target.id} className={`${selectedFeed ? 'h-48 md:h-auto' : ''}`}>
                          <FeedCard 
                              target={target} 
                              isSelected={false}
                              onSelect={() => setSelectedFeed(target.id)}
                              stats={feedStats[target.id] || { bitrate: 0, fps: 0, signal: 0 }}
                          />
                      </div>
                  ))}
              </div>
          )}
      </div>
    </div>
  );
};
