
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useStore } from '../services/mockStore';
import { Mic, X, Users, ChevronRight, Lock, Shield, Radio as RadioIcon, Battery, RefreshCw, Volume2, User, ShieldAlert } from 'lucide-react';
import { Role } from '../types';

interface MilitaryRadioProps {
  onClose: () => void;
}

// --- Audio Synthesis Helper ---
const useMilitaryAudio = () => {
    const audioCtxRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        return () => {
            audioCtxRef.current?.close();
        };
    }, []);

    const playStatic = (duration = 0.3) => {
        if (!audioCtxRef.current) return;
        const ctx = audioCtxRef.current;
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = ctx.createGain();
        gain.gain.value = 0.15; // Volume
        noise.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
    };

    const playRogerBeep = () => {
        if (!audioCtxRef.current) return;
        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = 2000;
        osc.type = 'sine';
        gain.gain.value = 0.1;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
    };

    return { playStatic, playRogerBeep };
};

export const MilitaryRadio: React.FC<MilitaryRadioProps> = ({ onClose }) => {
  const { sendHumanMessage, admins, users, currentRole, currentUser, humanMessages } = useStore();
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<string>('ALL');
  const [channel, setChannel] = useState<{name: string, freq: string}>({ name: 'CMD-NET', freq: '145.00' });
  const [volume, setVolume] = useState(75);
  const [statusText, setStatusText] = useState('STANDBY');
  const [logs, setLogs] = useState<string[]>([]);
  const [isBooting, setIsBooting] = useState(true);
  const [signalStrength, setSignalStrength] = useState(100);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { playStatic, playRogerBeep } = useMilitaryAudio();
  
  const lastPlayedMessageId = useRef<string | null>(null);

  // --- Dynamic Target Resolution ---
  const availableTargets = useMemo(() => {
      let targets: Array<{ id: string, name: string, role: string, label: string }> = [];

      if (currentRole === Role.SUPER_ADMIN) {
          // Super Admin can talk to all City Admins
          targets = admins
            .filter(a => a.role === Role.CITY_ADMIN)
            .map(a => ({ id: a.id, name: a.name, role: 'CITY_ADMIN', label: a.assignedCity || 'City Admin' }));
      } 
      else if (currentRole === Role.CITY_ADMIN && currentUser) {
          // 1. HQ (Super Admin)
          const superAdmins = admins
            .filter(a => a.role === Role.SUPER_ADMIN)
            .map(a => ({ id: a.id, name: a.name, role: 'SUPER_ADMIN', label: 'HQ Command' }));
          
          // 2. Peer City Admins (Enable City-to-City Comms)
          const otherAdmins = admins
            .filter(a => a.role === Role.CITY_ADMIN && a.id !== currentUser.id)
            .map(a => ({ id: a.id, name: a.name, role: 'CITY_ADMIN', label: a.assignedCity || 'Remote Station' }));

          // 3. Local Users
          const myUsers = users
            .filter(u => u.createdByAdminId === currentUser.id)
            .map(u => ({ id: u.id, name: u.fullName, role: 'USER', label: 'Traveler' }));

          targets = [...superAdmins, ...otherAdmins, ...myUsers];
      }
      else if (currentRole === Role.USER && currentUser) {
          // User can talk to their specific City Admin
          const myAdminId = (currentUser as any).createdByAdminId;
          const myAdmin = admins.find(a => a.id === myAdminId);
          if (myAdmin) {
              targets = [{ id: myAdmin.id, name: myAdmin.name, role: 'CITY_ADMIN', label: 'Base Station' }];
          }
      }

      return targets;
  }, [currentRole, currentUser, admins, users]);

  const activeUnits = availableTargets.length;

  // Boot Sequence
  useEffect(() => {
      const boot = async () => {
          addLog("SYSTEM BOOT...");
          await new Promise(r => setTimeout(r, 600));
          addLog("CHECKING ENCRYPTION KEYS...");
          await new Promise(r => setTimeout(r, 800));
          addLog("AES-256: SECURE");
          await new Promise(r => setTimeout(r, 400));
          addLog("LINK ESTABLISHED.");
          setIsBooting(false);
      }
      boot();
  }, []);

  // Signal Simulation
  useEffect(() => {
      const interval = setInterval(() => {
          setSignalStrength(prev => Math.max(60, Math.min(100, prev + (Math.random() - 0.5) * 20)));
      }, 2000);
      return () => clearInterval(interval);
  }, []);

  // --- Incoming Message Listener ---
  useEffect(() => {
      if (!currentUser || isTransmitting) return;

      // Find the most recent radio message
      const latestRadioMsg = humanMessages
          .filter(m => m.type === 'radio' && m.mediaUrl)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

      if (!latestRadioMsg) return;

      // Check if we should play it
      const isNew = latestRadioMsg.id !== lastPlayedMessageId.current;
      const isNotMe = latestRadioMsg.senderId !== currentUser.id;
      // It's for me if: explicitly addressed OR broadcast to ALL
      const isForMe = latestRadioMsg.receiverId === currentUser.id || latestRadioMsg.receiverId === 'ALL';
      const isRecent = (Date.now() - new Date(latestRadioMsg.timestamp).getTime()) < 15000;

      if (isNew && isNotMe && isForMe && isRecent) {
          lastPlayedMessageId.current = latestRadioMsg.id;
          
          // Auto-switch target to sender for easy reply
          if (latestRadioMsg.senderId) {
              const senderInList = availableTargets.find(t => t.id === latestRadioMsg.senderId);
              if (senderInList) {
                  setSelectedTarget(latestRadioMsg.senderId);
                  addLog(`LOCKED ON: ${senderInList.name.substring(0,8).toUpperCase()}`);
              }
          }

          playIncomingAudio(latestRadioMsg.mediaUrl!, latestRadioMsg.senderName);
      }

  }, [humanMessages, currentUser, isTransmitting, availableTargets]);

  const playIncomingAudio = async (base64Audio: string, senderName: string) => {
        playStatic(0.15); // squelch open
        
        const audio = new Audio(base64Audio);
        audio.volume = Math.max(0.1, volume / 100);
        
        setStatusText(`RX: ${senderName.toUpperCase().substring(0,10)}`);
        addLog(`INCOMING: ${senderName}`);
        setIsReceiving(true);
        
        audio.onended = () => {
            playStatic(0.2); // squelch close
            setIsReceiving(false);
            setStatusText('STANDBY');
            addLog("END TRANSMISSION");
        };
        
        try {
            await audio.play();
        } catch (e) {
            console.error("Autoplay blocked", e);
            addLog("ERR: AUDIO BLOCKED");
            setIsReceiving(false);
            setStatusText('STANDBY');
        }
  };

  const addLog = (msg: string) => {
      setLogs(prev => [...prev.slice(-4), `> ${msg}`]);
  };

  const cycleChannel = () => {
      playStatic(0.1);
      const channels = [
          { name: 'CMD-NET', freq: '145.00' },
          { name: 'TAC-1', freq: '446.55' },
          { name: 'AIR-OPS', freq: '121.50' },
          { name: 'SECURE-X', freq: '900.00' },
      ];
      const idx = channels.findIndex(c => c.name === channel.name);
      const next = channels[(idx + 1) % channels.length];
      setChannel(next);
      addLog(`CH SWITCH: ${next.name}`);
  };

  const adjustVolume = () => {
      const newVol = (volume + 25) % 125;
      setVolume(newVol === 0 ? 25 : newVol);
      addLog(`VOL: ${newVol}%`);
  };

  const startTransmission = async () => {
    try {
      playStatic(0.2);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsTransmitting(true);
      setStatusText('TX OPEN');
      const targetName = selectedTarget === 'ALL' ? 'GLOBAL' : availableTargets.find(t => t.id === selectedTarget)?.name.substring(0,10) || 'UNKNOWN';
      addLog(`TX START > ${targetName.toUpperCase()}`);
    } catch (err) {
      console.error("Radio Mic Error:", err);
      addLog("ERR: MIC ACCESS DENIED");
    }
  };

  const stopTransmission = () => {
    if (mediaRecorderRef.current && isTransmitting) {
      mediaRecorderRef.current.onstop = () => {
        playRogerBeep();
        setTimeout(() => playStatic(0.2), 150);

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const tracks = mediaRecorderRef.current?.stream.getTracks();
        tracks?.forEach(track => track.stop());

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
            const base64data = reader.result as string;
            
            if (selectedTarget === 'ALL') {
                // Broadcast to all visible targets
                availableTargets.forEach(t => {
                    sendHumanMessage("Radio Broadcast", t.id, 'radio', base64data, 5); 
                });
                addLog("TX SENT: BROADCAST");
            } else {
                sendHumanMessage("Radio Transmission", selectedTarget, 'radio', base64data, 5);
                const targetName = availableTargets.find(a => a.id === selectedTarget)?.name || selectedTarget;
                addLog(`TX SENT: ${targetName.substring(0, 10)}`);
            }
        };

        setIsTransmitting(false);
        setStatusText('STANDBY');
      };
      mediaRecorderRef.current.stop();
    }
  };

  const getTargetIcon = (role: string) => {
      switch(role) {
          case 'SUPER_ADMIN': return <ShieldAlert size={10} />;
          case 'CITY_ADMIN': return <Shield size={10} />;
          default: return <User size={10} />;
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Radio Unit */}
      <div className="relative bg-slate-900 w-80 md:w-96 rounded-[2rem] border-[6px] border-slate-800 shadow-2xl overflow-hidden flex flex-col transform transition-all animate-in zoom-in-95 duration-200 ring-1 ring-white/10">
        
        {/* Physical Texture */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '4px 4px' }}></div>

        {/* Antenna */}
        <div className="absolute -top-20 right-8 w-4 h-24 bg-gradient-to-l from-slate-600 to-slate-800 rounded-t-full border-x border-slate-900 z-[-1] shadow-xl"></div>

        {/* Header Guard */}
        <div className="bg-slate-800/90 p-4 border-b-2 border-black flex justify-between items-center z-10 shadow-lg">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
                isTransmitting ? 'bg-red-500 animate-pulse shadow-[0_0_12px_#ef4444]' : 
                isReceiving ? 'bg-amber-500 animate-pulse shadow-[0_0_12px_#f59e0b]' :
                'bg-emerald-500 shadow-[0_0_10px_#10b981]'
            }`}></div>
            <div className="flex flex-col">
                <span className="font-mono text-[10px] text-slate-400 font-bold tracking-widest leading-none">PRC-117F</span>
                <span className={`font-mono text-[10px] font-bold tracking-widest leading-none mt-1 ${
                    isTransmitting ? 'text-red-500' : isReceiving ? 'text-amber-500' : 'text-emerald-500'
                }`}>
                    {isTransmitting ? 'TRANSMITTING' : isReceiving ? 'RECEIVING' : 'ENCRYPTED'}
                </span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-red-400 transition-colors p-1 bg-black/20 rounded-full">
            <X size={18} />
          </button>
        </div>

        {/* LCD Screen Container */}
        <div className="p-6 bg-slate-800/50 relative">
           <div className="w-full bg-[#121619] rounded-lg border-4 border-[#0a0c0e] p-1 shadow-[inset_0_0_20px_rgba(0,0,0,1)] relative overflow-hidden h-56 flex flex-col">
              
              {/* Scanlines & Glare */}
              <div className="absolute inset-0 z-20 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%]"></div>
              <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-br from-white/5 to-transparent rounded-lg"></div>

              {/* Screen Content */}
              <div className="relative z-10 flex flex-col h-full font-mono text-green-500 p-2 select-none">
                  
                  {isBooting ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-xs space-y-2 animate-pulse">
                          <RefreshCw className="animate-spin text-green-500 mb-2" size={24} />
                          {logs.map((l, i) => <div key={i}>{l}</div>)}
                      </div>
                  ) : (
                      <>
                        {/* Top Bar */}
                        <div className="flex justify-between items-end border-b border-green-900/50 pb-1 mb-2">
                            <div>
                                <div className="text-[10px] text-green-700 font-bold mb-0.5">{channel.name}</div>
                                <div className="text-2xl font-bold leading-none tracking-wider text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.4)]">
                                    {channel.freq}<span className="text-[10px] ml-1 opacity-70">MHz</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="flex gap-0.5 items-end h-3 mb-1">
                                    {[1,2,3,4,5].map(i => (
                                        <div key={i} className={`w-1 rounded-sm ${signalStrength > i*18 ? 'bg-green-500' : 'bg-green-900'}`} style={{height: `${i*20}%`}}></div>
                                    ))}
                                </div>
                                <div className="text-[9px] text-green-600 flex items-center gap-1">
                                    <Battery size={8} /> {signalStrength}%
                                </div>
                            </div>
                        </div>

                        {/* List Area */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-0.5 pr-1">
                            <div 
                                onClick={() => setSelectedTarget('ALL')}
                                className={`flex justify-between items-center px-2 py-1 text-[10px] cursor-pointer hover:bg-green-900/30 ${selectedTarget === 'ALL' ? 'bg-green-900/50 text-white font-bold' : 'text-green-600'}`}
                            >
                                <span>[BROADCAST ALL]</span>
                                {selectedTarget === 'ALL' && <ChevronRight size={10} />}
                            </div>
                            {availableTargets.map(target => (
                                <div 
                                    key={target.id}
                                    onClick={() => setSelectedTarget(target.id)}
                                    className={`flex justify-between items-center px-2 py-1 text-[10px] cursor-pointer hover:bg-green-900/30 ${selectedTarget === target.id ? 'bg-green-900/50 text-white font-bold' : 'text-green-600'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        {getTargetIcon(target.role)}
                                        <span>{target.name.toUpperCase().substring(0, 14)}</span>
                                    </div>
                                    {selectedTarget === target.id && <ChevronRight size={10} />}
                                </div>
                            ))}
                            {availableTargets.length === 0 && (
                                <div className="text-[9px] text-green-900 italic text-center py-2">NO TARGETS IN RANGE</div>
                            )}
                        </div>

                        {/* Logs Footer */}
                        <div className="mt-auto pt-2 border-t border-green-900/50">
                            <div className="text-[9px] text-green-400 h-8 overflow-hidden flex flex-col justify-end">
                                {logs.slice(-2).map((log, i) => (
                                    <div key={i} className="truncate opacity-80">{log}</div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center mt-1">
                                <span className={`text-[10px] px-1 rounded ${
                                    isTransmitting ? 'bg-red-900 text-red-100 animate-pulse' : 
                                    isReceiving ? 'bg-amber-900 text-amber-100 animate-pulse' :
                                    'bg-green-900 text-green-100'
                                }`}>
                                    {statusText}
                                </span>
                                <Lock size={8} className="text-green-600" />
                            </div>
                        </div>
                      </>
                  )}
              </div>
           </div>
        </div>

        {/* Controls Area */}
        <div className="bg-slate-800 p-6 pt-0 relative flex flex-col items-center">
            
            {/* Knobs */}
            <div className="flex justify-between w-full px-6 py-4">
               <div className="flex flex-col items-center gap-1 group cursor-pointer" onClick={adjustVolume}>
                   <div className="w-12 h-12 rounded-full bg-gradient-to-b from-slate-700 to-slate-900 border-2 border-slate-600 shadow-lg flex items-center justify-center transform transition-transform active:scale-95 relative">
                       <div className="w-1 h-4 bg-slate-400 absolute top-1 rounded-full"></div>
                       <Volume2 size={16} className="text-slate-400" />
                   </div>
                   <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Vol</span>
               </div>

               <div className="flex flex-col items-center gap-1 group cursor-pointer" onClick={cycleChannel}>
                   <div className="w-12 h-12 rounded-full bg-gradient-to-b from-slate-700 to-slate-900 border-2 border-slate-600 shadow-lg flex items-center justify-center transform transition-transform active:scale-95 relative">
                       <div className="w-1 h-4 bg-slate-400 absolute top-1 rounded-full" style={{ transform: `rotate(${Math.random() * 90}deg)` }}></div>
                       <RadioIcon size={16} className="text-slate-400" />
                   </div>
                   <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Chan</span>
               </div>
            </div>

            <div className="w-full h-px bg-slate-700/50 mb-6"></div>

            {/* PTT Button */}
            <button
                onMouseDown={startTransmission}
                onMouseUp={stopTransmission}
                onTouchStart={startTransmission}
                onTouchEnd={stopTransmission}
                className={`
                    w-28 h-28 rounded-full border-[6px] flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-all duration-100 relative group
                    ${isTransmitting 
                        ? 'bg-red-700 border-red-900 scale-95 shadow-[inset_0_4px_10px_rgba(0,0,0,0.5)]' 
                        : 'bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-slate-500'
                    }
                `}
            >
                {/* Tactical Texture on Button */}
                <div className="absolute inset-0 rounded-full opacity-30" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '4px 4px' }}></div>
                
                <div className={`
                    w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center relative z-10
                    ${isTransmitting ? 'border-white/30 animate-[spin_3s_linear_infinite]' : 'border-slate-500/30'}
                `}>
                    <Mic size={32} className={`drop-shadow-md transition-colors ${isTransmitting ? 'text-white' : 'text-slate-400'}`} />
                </div>
            </button>
            <span className="mt-4 text-[10px] font-bold text-slate-500 tracking-[0.3em] uppercase">Push to Talk</span>
        </div>

        {/* Footer Panel */}
        <div className="bg-[#0f1115] px-4 py-2 flex justify-between items-center text-[9px] font-mono border-t border-black">
            <div className="flex items-center gap-2 text-slate-500">
                <Users size={10} />
                <span>{activeUnits} UNITS ONLINE</span>
            </div>
            <div className="flex items-center gap-2">
                <ShieldAlert size={10} className={currentRole === Role.SUPER_ADMIN ? 'text-blue-500' : 'text-slate-600'} />
                <span className="text-slate-500">AUTH: {currentRole === Role.SUPER_ADMIN ? 'ROOT' : 'STD'}</span>
            </div>
        </div>
      </div>
    </div>
  );
};
