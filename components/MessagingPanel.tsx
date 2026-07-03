
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useStore } from '../services/mockStore';
import { Role, RegisteredUser, AdminUser } from '../types';
import { X, Send, Search, MoreVertical, Check, CheckCheck, User, Shield, ShieldAlert, Lock, Mic, Trash, Play, Pause, Smile, Paperclip, ChevronLeft, Image as ImageIcon, Phone, PhoneOff, FileText, Download, Users, PhoneCall, CheckSquare, Square, MicOff } from 'lucide-react';

interface MessagingPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AudioPlayer = ({ src, duration, isMe }: { src: string, duration?: number, isMe: boolean }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleEnded = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    const formatTime = (time: number) => {
        if (!isFinite(time)) return "0:00";
        const m = Math.floor(time / 60);
        const s = Math.floor(time % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // Use provided duration until audio metadata is loaded
    const displayDuration = audioRef.current?.duration || duration || 0;

    return (
        <div className="flex items-center gap-3 w-60">
            <audio ref={audioRef} src={src} preload="metadata" />
            <button 
                onClick={togglePlay}
                type="button"
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0 ${isMe ? 'bg-white/20 hover:bg-white/30 text-slate-800' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
            >
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
            </button>
            <div className="flex-1 flex flex-col gap-1 min-w-0">
                 <div className="h-1 bg-black/10 rounded-full overflow-hidden w-full">
                     <div 
                        className={`h-full transition-all duration-100 ${isMe ? 'bg-slate-800' : 'bg-blue-500'}`}
                        style={{ width: `${displayDuration > 0 ? (currentTime / displayDuration) * 100 : 0}%` }}
                     ></div>
                 </div>
                 <div className="flex justify-between text-[10px] opacity-70">
                     <span>{formatTime(currentTime)}</span>
                     <span>{formatTime(displayDuration)}</span>
                 </div>
            </div>
        </div>
    );
};

export const MessagingPanel: React.FC<MessagingPanelProps> = ({ isOpen, onClose }) => {
  const { currentRole, currentUser, humanMessages, sendHumanMessage, markMessagesAsRead, users, admins } = useStore();
  const [inputText, setInputText] = useState('');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Conference Call State (Super Admin Only)
  const [isConferenceMode, setIsConferenceMode] = useState(false);
  const [selectedConferenceIds, setSelectedConferenceIds] = useState<string[]>([]);
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  // File Upload Refs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  // Call State
  const [callState, setCallState] = useState<'idle' | 'calling' | 'connected'>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const callTimerRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Stop recording if panel closes
  useEffect(() => {
    if (!isOpen) {
        if (isRecording) {
            stopRecording(false);
        }
        // Reset conference mode on close
        setIsConferenceMode(false);
        setSelectedConferenceIds([]);
        endCall();
    }
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
      return () => {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          if (callTimerRef.current) clearInterval(callTimerRef.current);
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
          }
      };
  }, []);

  // --- Contact Discovery Logic ---
  const contacts = useMemo(() => {
    if (!currentUser) return [];

    let potentialContacts: Array<{ id: string, name: string, role: string, photoUrl?: string, city?: string }> = [];

    if (currentRole === Role.USER) {
        const user = currentUser as RegisteredUser;
        // STRICT RULE: Users can ONLY contact the CITY Admin who created them.
        if (user.createdByAdminId) {
            const creator = admins.find(a => a.id === user.createdByAdminId);
            if (creator && creator.role === Role.CITY_ADMIN) {
                potentialContacts.push({ 
                    id: creator.id, 
                    name: creator.name, 
                    role: 'City Admin', 
                    photoUrl: creator.photoUrl,
                    city: creator.assignedCity 
                });
            }
        }
    } 
    else if (currentRole === Role.CITY_ADMIN) {
        const admin = currentUser as AdminUser;
        
        // 1. Super Admin
        const superAdmins = admins.filter(a => a.role === Role.SUPER_ADMIN);
        potentialContacts.push(...superAdmins.map(a => ({ 
            id: a.id, 
            name: a.name, 
            role: 'Super Admin', 
            photoUrl: a.photoUrl, 
            city: a.assignedCity 
        })));

        // 2. Users created by this Admin
        const myUsers = users.filter(u => u.createdByAdminId === admin.id);
        potentialContacts.push(...myUsers.map(u => ({ 
            id: u.id, 
            name: u.fullName, 
            role: 'User', 
            photoUrl: u.photoUrl, 
            city: u.city 
        })));
    } 
    else if (currentRole === Role.SUPER_ADMIN) {
        // 1. City Admins
        const cityAdmins = admins.filter(a => a.role === Role.CITY_ADMIN);
        potentialContacts.push(...cityAdmins.map(a => ({ 
            id: a.id, 
            name: a.name, 
            role: 'City Admin', 
            photoUrl: a.photoUrl, 
            city: a.assignedCity 
        })));
    }

    return potentialContacts.map(contact => {
        const conversationMessages = humanMessages.filter(m => 
            (m.senderId === currentUser.id && m.receiverId === contact.id) ||
            (m.senderId === contact.id && m.receiverId === currentUser.id)
        );
        
        const lastMessage = conversationMessages.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        const unreadCount = conversationMessages.filter(m => m.receiverId === currentUser.id && !m.read).length;

        return {
            ...contact,
            lastMessage,
            unreadCount
        };
    }).sort((a, b) => {
        const timeA = a.lastMessage ? new Date(a.lastMessage.timestamp).getTime() : 0;
        const timeB = b.lastMessage ? new Date(b.lastMessage.timestamp).getTime() : 0;
        return timeB - timeA;
    });

  }, [currentUser, currentRole, users, admins, humanMessages]);

  const filteredContacts = useMemo(() => {
      return contacts.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [contacts, searchTerm]);

  // Auto-select first contact if none selected for Users (only if not in conference mode)
  useEffect(() => {
      if (isOpen && !selectedContactId && contacts.length > 0 && currentRole === Role.USER && !isConferenceMode) {
           setSelectedContactId(contacts[0].id);
      }
  }, [isOpen, selectedContactId, contacts, currentRole, isConferenceMode]);

  // Messages for active chat
  const activeMessages = useMemo(() => {
      if (!currentUser || !selectedContactId) return [];

      return humanMessages.filter(m => 
          (m.senderId === currentUser.id && m.receiverId === selectedContactId) ||
          (m.senderId === selectedContactId && m.receiverId === currentUser.id)
      ).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [humanMessages, currentUser, selectedContactId]);

  // Auto-scroll
  useEffect(() => {
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeMessages.length, isOpen, selectedContactId]);

  // Mark read
  useEffect(() => {
      if (isOpen && selectedContactId) {
          markMessagesAsRead(selectedContactId);
      }
  }, [isOpen, selectedContactId, activeMessages.length]);

  const handleSend = (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputText.trim() || !selectedContactId) return;

      sendHumanMessage(inputText, selectedContactId);
      setInputText('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedContactId) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64data = reader.result as string;
            sendHumanMessage("Image Shared", selectedContactId, 'image', base64data);
        };
        reader.readAsDataURL(file);
    }
    // Clear input
    if (imageInputRef.current) {
        imageInputRef.current.value = '';
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedContactId) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64data = reader.result as string;
            const fileSizeKB = (file.size / 1024).toFixed(0) + ' KB';
            sendHumanMessage("Document Shared", selectedContactId, 'document', base64data, undefined, file.name, fileSizeKB);
        };
        reader.readAsDataURL(file);
    }
    if (documentInputRef.current) {
        documentInputRef.current.value = '';
    }
  };

  const startRecording = async () => {
      try {
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
          setIsRecording(true);
          setRecordingDuration(0);

          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = setInterval(() => {
              setRecordingDuration(prev => prev + 1);
          }, 1000);

      } catch (err) {
          console.error("Microphone error:", err);
          alert("Unable to access microphone. Please allow microphone permissions to send voice messages.");
      }
  };

  const stopRecording = (shouldSend: boolean) => {
      if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.onstop = async () => {
              const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
              const tracks = mediaRecorderRef.current?.stream.getTracks();
              tracks?.forEach(track => track.stop());

              if (shouldSend && selectedContactId) {
                  // Minimum duration check to avoid accidental clicks (e.g. < 0.5s)
                  if (audioBlob.size > 1000) { // Basic size check
                      const reader = new FileReader();
                      reader.readAsDataURL(audioBlob);
                      reader.onloadend = () => {
                          const base64data = reader.result as string;
                          // Use the captured duration
                          sendHumanMessage("Audio Message", selectedContactId, 'audio', base64data, recordingDuration || 1);
                      }
                  }
              }

              // Reset state
              setIsRecording(false);
              setRecordingDuration(0);
              if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
              audioChunksRef.current = [];
          };

          mediaRecorderRef.current.stop();
      } else {
          setIsRecording(false);
          setRecordingDuration(0);
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      }
  };

  // --- Call Logic ---
  const startCall = () => {
      setCallState('calling');
      setCallDuration(0);
      setIsMuted(false);
      
      // Simulate answer after 2 seconds
      setTimeout(() => {
          setCallState('connected');
          callTimerRef.current = setInterval(() => {
              setCallDuration(prev => prev + 1);
          }, 1000);
      }, 2000);
  };

  const startConferenceCall = () => {
     if (selectedConferenceIds.length < 2) return;
     setCallState('calling');
     setCallDuration(0);
     setIsMuted(false);
     setTimeout(() => {
          setCallState('connected');
          callTimerRef.current = setInterval(() => {
              setCallDuration(prev => prev + 1);
          }, 1000);
      }, 2000);
  };

  const endCall = () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      
      // Log call to all participants (if conference) or single contact
      if (isConferenceMode && selectedConferenceIds.length > 0) {
          selectedConferenceIds.forEach(id => {
              sendHumanMessage("Conference Call ended", id, 'call', undefined, callDuration);
          });
          // Reset conference mode after call
          setIsConferenceMode(false);
          setSelectedConferenceIds([]);
      } else if (selectedContactId && callState === 'connected') {
          sendHumanMessage("Call ended", selectedContactId, 'call', undefined, callDuration);
      }
      
      setCallState('idle');
  };

  const formatDuration = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleConferenceMode = () => {
      const newMode = !isConferenceMode;
      setIsConferenceMode(newMode);
      setSelectedContactId(null);
      setSelectedConferenceIds([]);
  };

  const toggleConferenceSelection = (id: string) => {
      setSelectedConferenceIds(prev => 
          prev.includes(id) 
            ? prev.filter(c => c !== id) 
            : [...prev, id]
      );
  };

  if (!isOpen) return null;

  const selectedContact = contacts.find(c => c.id === selectedContactId);
  // Get all participants for conference overlay
  const conferenceParticipants = contacts.filter(c => selectedConferenceIds.includes(c.id));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 font-sans">
       <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
       
       <div className="relative w-full md:max-w-7xl h-full md:h-[92vh] bg-white md:rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-200">
          
          {/* Call Overlay */}
          {callState !== 'idle' && (
              <div className="absolute inset-0 z-50 bg-white text-slate-900 animate-in fade-in duration-500 overflow-hidden flex flex-col">
                  
                  {/* Common Header: Call Status */}
                  <div className="shrink-0 pt-8 pb-4 flex justify-center z-20">
                      <div className="bg-slate-50 border border-slate-200 rounded-full px-6 py-2 flex items-center gap-3 shadow-sm">
                           <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                           <h3 className="text-xs font-bold tracking-widest uppercase text-slate-500">{isConferenceMode ? 'Conference Live' : 'Call Active'}</h3>
                           <div className="w-px h-4 bg-slate-300"></div>
                           <div className="text-xs font-mono text-slate-600">{formatDuration(callDuration)}</div>
                      </div>
                  </div>

                  {/* Single Call Layout (Original) */}
                  {!isConferenceMode && selectedContact && (
                      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                        <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white mb-8 shadow-xl relative bg-slate-100 ring-1 ring-slate-200">
                            <div className="w-full h-full flex items-center justify-center">
                                {selectedContact.photoUrl ? (
                                    <img src={selectedContact.photoUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-6xl font-bold text-slate-400">{selectedContact.name.charAt(0)}</div>
                                )}
                            </div>
                            <div className="absolute inset-0 rounded-full animate-pulse border border-blue-500/20 pointer-events-none"></div>
                        </div>
                        <h3 className="text-3xl font-bold mb-2 text-slate-800">{selectedContact.name}</h3>
                        <p className="text-blue-600 font-medium">Connected • {selectedContact.role}</p>
                        
                         <div className="flex gap-8 items-center mt-12">
                            <button 
                                onClick={() => setIsMuted(!isMuted)}
                                className={`p-5 rounded-full transition-all border ${isMuted ? 'bg-red-50 text-red-500 border-red-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-lg'}`}
                            >
                                {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
                            </button>

                            <button 
                                onClick={endCall}
                                className="p-6 bg-red-600 rounded-full text-white hover:bg-red-700 transition-all shadow-xl shadow-red-600/30 hover:scale-105"
                            >
                                <PhoneOff size={36} />
                            </button>
                         </div>
                      </div>
                  )}

                  {/* Conference Call Layout (Static Fixed Structure) */}
                  {isConferenceMode && (
                      <div className="flex-1 flex flex-col min-h-0 bg-white relative">
                          
                          {/* 1. Host Section (Static Fixed Top) */}
                          <div className="shrink-0 w-full flex flex-col items-center py-6 z-20 bg-white relative border-b border-slate-100 shadow-sm">
                               <div className="relative mb-3">
                                   <div className="w-24 h-24 rounded-full p-1 bg-white ring-1 ring-slate-100 shadow-xl shadow-slate-200/50 relative z-10">
                                       <div className="w-full h-full rounded-full overflow-hidden">
                                          {(currentUser as any)?.photoUrl ? (
                                              <img src={(currentUser as any).photoUrl} className="w-full h-full object-cover" alt="Host" />
                                          ) : (
                                              <div className="w-full h-full bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-400">
                                                  {(currentUser as any)?.name?.charAt(0) || 'S'}
                                              </div>
                                          )}
                                       </div>
                                   </div>
                               </div>
                               
                               <div className="text-center">
                                   <h2 className="text-lg font-bold text-slate-800 tracking-tight">{(currentUser as any)?.name || 'Super Admin'}</h2>
                                   <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Host</span>
                               </div>
                          </div>

                          {/* 2. Participants List (Scrollable Middle) */}
                          <div className="flex-1 overflow-y-auto custom-scrollbar w-full relative z-0 bg-white">
                              <div className="flex flex-col items-center px-6 gap-3 pb-6 max-w-2xl mx-auto pt-6">
                                  {conferenceParticipants.map((p) => (
                                      <div key={p.id} className="flex items-center gap-4 w-full p-3 rounded-2xl border border-slate-100 shadow-sm bg-white hover:border-blue-200 hover:shadow-md transition-all">
                                          
                                          <div className="relative shrink-0">
                                              <div className="w-12 h-12 rounded-full bg-slate-100 border border-white shadow-sm overflow-hidden relative ring-1 ring-slate-100">
                                                   {p.photoUrl ? (
                                                      <img src={p.photoUrl} className="w-full h-full object-cover" alt={p.name} />
                                                   ) : (
                                                      <div className="w-full h-full flex items-center justify-center text-sm font-bold text-slate-400">{p.name.charAt(0)}</div>
                                                   )}
                                              </div>
                                              
                                              {/* Status Dot */}
                                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-white rounded-full flex items-center justify-center shadow-sm">
                                                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                              </div>
                                          </div>

                                          <div className="flex-1 min-w-0 text-left">
                                               <p className="text-sm font-bold text-slate-800 truncate">{p.name}</p>
                                               <p className="text-xs text-slate-500 font-medium truncate">{p.city || 'Admin'}</p>
                                          </div>

                                          {/* Simple Audio Waveform */}
                                          <div className="flex items-center gap-0.5 h-4 opacity-100 shrink-0 px-2">
                                              {[...Array(5)].map((_, i) => (
                                                  <div 
                                                      key={i} 
                                                      className="w-1 bg-emerald-400 rounded-full animate-music" 
                                                      style={{ 
                                                          animationDuration: `${0.4 + Math.random() * 0.4}s`,
                                                          animationDelay: `${i * 0.1}s`,
                                                          height: '8px'
                                                      }}
                                                  ></div>
                                              ))}
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>

                          {/* 3. Controls Footer (Static Fixed Bottom) */}
                          <div className="shrink-0 p-6 flex justify-center z-30 bg-white border-t border-slate-100 w-full">
                                <div className="flex items-center gap-8">
                                    <button 
                                        onClick={() => setIsMuted(!isMuted)}
                                        className={`p-4 rounded-full transition-all border shadow-sm ${isMuted ? 'bg-red-50 text-red-500 border-red-100' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'}`}
                                        title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
                                    >
                                        {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                                    </button>

                                    <button 
                                        onClick={endCall}
                                        className="p-5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-xl shadow-red-600/30 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center"
                                        title="End Conference Call"
                                    >
                                        <PhoneOff size={32} />
                                    </button>
                                    
                                    <div className="flex flex-col items-center justify-center w-14">
                                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Active</span>
                                        <span className="text-lg font-mono font-bold text-slate-800">{conferenceParticipants.length + 1}</span>
                                    </div>
                                </div>
                          </div>
                      </div>
                  )}

                  <style>{`
                      @keyframes music {
                          0%, 100% { height: 4px; opacity: 0.6; }
                          50% { height: 12px; opacity: 1; }
                      }
                      .animate-music {
                          animation-name: music;
                          animation-iteration-count: infinite;
                      }
                  `}</style>
              </div>
          )}

          {/* Contact List */}
          <div className={`${(selectedContactId && !isConferenceMode) ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-[380px] border-r border-slate-200 bg-white h-full transition-all`}>
              <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center shrink-0 h-16">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-slate-300 overflow-hidden border border-slate-300">
                        {(currentUser as any)?.photoUrl ? (
                            <img src={(currentUser as any).photoUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500"><User size={20} /></div>
                        )}
                     </div>
                     <span className="font-bold text-slate-700 hidden sm:block">{(currentUser as any)?.fullName || (currentUser as any)?.name}</span>
                  </div>
                  <div className="flex gap-2 text-slate-500">
                      {currentRole === Role.SUPER_ADMIN && (
                          <button 
                            onClick={toggleConferenceMode}
                            className={`p-2 rounded-lg transition-all ${isConferenceMode ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-200 text-slate-600'}`}
                            title="Toggle Conference Call Mode"
                          >
                              <Users size={20} />
                          </button>
                      )}
                      <button title="Options" className="hover:text-slate-800"><MoreVertical size={20} /></button>
                  </div>
              </div>

              {/* Conference Header (Only in Conference Mode) */}
              {isConferenceMode && (
                  <div className="bg-blue-50 p-3 border-b border-blue-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-800 uppercase">Select Participants ({selectedConferenceIds.length})</span>
                      {selectedConferenceIds.length >= 2 && (
                          <button 
                            onClick={startConferenceCall}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-sm flex items-center gap-1.5 transition-all animate-in zoom-in"
                          >
                              <PhoneCall size={14} /> Start Conference
                          </button>
                      )}
                  </div>
              )}

              <div className="p-3 border-b border-slate-100 bg-white">
                  <div className="relative">
                      <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                      <input 
                        placeholder="Search secure contacts..." 
                        className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-0 placeholder-slate-500"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                  </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {filteredContacts.length > 0 ? (
                    filteredContacts.map(contact => {
                        const isSelected = isConferenceMode 
                            ? selectedConferenceIds.includes(contact.id)
                            : selectedContactId === contact.id;

                        return (
                        <div 
                            key={contact.id}
                            onClick={() => isConferenceMode ? toggleConferenceSelection(contact.id) : setSelectedContactId(contact.id)}
                            className={`flex items-center gap-3 p-3 cursor-pointer border-b border-slate-50 transition-colors ${isSelected ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                        >
                            {/* Conference Checkbox */}
                            {isConferenceMode && (
                                <div className={`shrink-0 text-slate-400 ${isSelected ? 'text-blue-600' : ''}`}>
                                    {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                                </div>
                            )}

                            <div className="relative shrink-0">
                                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border border-slate-200">
                                     {contact.photoUrl ? (
                                         <img src={contact.photoUrl} className="w-full h-full object-cover" alt="" />
                                     ) : (
                                         <span className="font-bold text-slate-500 text-lg">{contact.name.charAt(0)}</span>
                                     )}
                                </div>
                                {contact.unreadCount > 0 && !isConferenceMode && <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <h4 className="font-semibold text-slate-800 truncate flex items-center gap-1.5">
                                        {contact.name} 
                                        <Lock size={10} className="text-slate-400" />
                                    </h4>
                                    {contact.lastMessage && !isConferenceMode && (
                                        <span className={`text-[10px] ${contact.unreadCount > 0 ? 'text-green-600 font-bold' : 'text-slate-400'}`}>
                                            {new Date(contact.lastMessage.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center">
                                    {!isConferenceMode ? (
                                        <p className={`text-sm truncate max-w-[180px] ${contact.unreadCount > 0 ? 'text-slate-800 font-semibold' : 'text-slate-500'}`}>
                                            {contact.lastMessage 
                                                ? (contact.lastMessage.type === 'audio' ? '🎤 Audio Message' 
                                                    : contact.lastMessage.type === 'image' ? '📷 Image' 
                                                    : contact.lastMessage.type === 'document' ? '📄 Document'
                                                    : contact.lastMessage.type === 'call' ? '📞 Call Log'
                                                    : contact.lastMessage.content)
                                                : <span className="italic opacity-50">Secure channel ready</span>
                                            }
                                        </p>
                                    ) : (
                                        <span className="text-xs text-slate-500">{contact.role} {contact.city && `• ${contact.city}`}</span>
                                    )}
                                    <div className="flex items-center gap-2">
                                        {contact.unreadCount > 0 && !isConferenceMode && (
                                            <span className="bg-green-500 text-white text-xs font-bold h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center">
                                                {contact.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )})
                  ) : (
                      <div className="p-8 text-center text-slate-400 text-sm">
                          {searchTerm ? 'No contacts match your search' : (
                              currentRole === Role.USER 
                                ? 'No assigned City Admin found. Please contact support.'
                                : 'No authorized contacts found.'
                          )}
                      </div>
                  )}
              </div>
          </div>

          {/* Chat Area */}
          <div className={`${(!selectedContactId || isConferenceMode) ? 'hidden md:flex' : 'flex'} flex-1 flex-col h-full bg-[#efeae2] relative`}>
             <div className="absolute inset-0 opacity-[0.4] pointer-events-none" style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')" }}></div>

             {isConferenceMode ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 z-10 bg-[#f0f2f5] border-l border-slate-200">
                      <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                           <Users size={64} className="text-blue-500" />
                      </div>
                      <h2 className="text-2xl font-bold text-slate-700 mb-2">Conference Mode</h2>
                      <p className="text-sm text-slate-500 max-w-md text-center">
                          Select multiple City Admins from the list on the left.<br/>
                          Once 2 or more are selected, you can initiate a secure group audio call.
                      </p>
                      <button 
                        onClick={toggleConferenceMode}
                        className="mt-8 text-slate-500 hover:text-slate-800 font-medium text-sm flex items-center gap-2 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors"
                      >
                          <X size={16} /> Cancel Conference
                      </button>
                 </div>
             ) : !selectedContactId ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 z-10 bg-[#f0f2f5] border-l border-slate-200">
                      <div className="w-64 h-64 bg-slate-200 rounded-full flex items-center justify-center mb-8 opacity-50 animate-in zoom-in-50">
                           <Shield size={80} className="text-slate-400" />
                      </div>
                      <h2 className="text-2xl font-light text-slate-600 mb-2">Puntland Secure Messaging</h2>
                      <p className="text-sm text-slate-500 max-w-md text-center">
                          Point-to-Point Encrypted Network. <br/>
                          Communications are strictly limited to your direct hierarchy.
                      </p>
                 </div>
             ) : (
                 <>
                    <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between shrink-0 z-10 shadow-sm h-16">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setSelectedContactId(null)} className="md:hidden p-1 text-slate-500 hover:bg-slate-200 rounded-full">
                                <ChevronLeft size={24} />
                            </button>
                            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-slate-200">
                                {selectedContact?.photoUrl ? (
                                    <img src={selectedContact.photoUrl} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">{selectedContact?.name.charAt(0)}</div>
                                )}
                            </div>
                            <div className="cursor-pointer">
                                <h3 className="font-semibold text-slate-800 leading-tight flex items-center gap-2">
                                    {selectedContact?.name}
                                </h3>
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                    {selectedContact?.role.includes('Super') && <ShieldAlert size={10} className="text-red-500" />}
                                    {selectedContact?.role.includes('City') && <Shield size={10} className="text-blue-500" />}
                                    {selectedContact?.role} {selectedContact?.city ? `• ${selectedContact.city}` : ''}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                             <button 
                                onClick={startCall}
                                className="hover:text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-colors" 
                                title="Voice Call"
                             >
                                <Phone size={20} />
                             </button>
                             <div className="h-6 w-px bg-slate-300 mx-1"></div>
                             <button onClick={onClose} className="hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"><X size={20} /></button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 z-10 scroll-smooth">
                        <div className="flex justify-center mb-6">
                            <span className="bg-yellow-100/90 backdrop-blur-sm text-yellow-800 text-[10px] px-3 py-1.5 rounded-lg shadow-sm border border-yellow-200 flex items-center gap-2 max-w-sm text-center">
                                <Lock size={12} className="shrink-0" /> 
                                Messages are encrypted. Only you and {selectedContact?.name} can read them.
                            </span>
                        </div>

                        {activeMessages.map((msg) => {
                            const isMe = msg.senderId === currentUser?.id;
                            const time = new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                            
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                                    <div 
                                        className={`
                                            relative max-w-[85%] md:max-w-[65%] px-4 py-2 rounded-lg shadow-sm text-sm
                                            ${isMe ? 'bg-[#d9fdd3] text-slate-900 rounded-tr-none' : 'bg-white text-slate-900 rounded-tl-none'}
                                        `}
                                    >
                                        {msg.type === 'audio' && msg.mediaUrl ? (
                                            <div className="py-1">
                                                <AudioPlayer src={msg.mediaUrl} duration={msg.duration} isMe={isMe} />
                                            </div>
                                        ) : msg.type === 'image' && msg.mediaUrl ? (
                                            <div className="py-1">
                                                <img src={msg.mediaUrl} alt="Sent image" className="rounded-lg max-w-full h-auto max-h-60 border border-slate-200 cursor-pointer hover:opacity-95" />
                                            </div>
                                        ) : msg.type === 'document' ? (
                                            <div className="py-1 flex items-center gap-3 min-w-[200px]">
                                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                                                    <FileText size={24} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-slate-800 truncate text-xs">{msg.fileName || 'Document'}</p>
                                                    <p className="text-[10px] text-slate-500">{msg.fileSize || 'Unknown Size'}</p>
                                                </div>
                                                <button className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors">
                                                    <Download size={16} />
                                                </button>
                                            </div>
                                        ) : msg.type === 'call' ? (
                                            <div className="py-1 flex items-center gap-3">
                                                 <div className="p-2 bg-slate-100 rounded-full text-slate-500">
                                                     <Phone size={16} />
                                                 </div>
                                                 <div>
                                                     <p className="font-semibold text-slate-700">Voice Call Ended</p>
                                                     <p className="text-[10px] text-slate-500">{formatDuration(msg.duration || 0)}</p>
                                                 </div>
                                            </div>
                                        ) : (
                                            <div className="whitespace-pre-wrap leading-relaxed">
                                                {msg.content}
                                                <span className="inline-block w-12"></span>
                                            </div>
                                        )}
                                        
                                        <div className="absolute bottom-1 right-2 flex items-center gap-1">
                                            {msg.type !== 'audio' && msg.type !== 'image' && msg.type !== 'document' && msg.type !== 'call' && <Lock size={8} className="text-slate-400 opacity-70" />}
                                            <span className="text-[10px] text-slate-500">{time}</span>
                                            {isMe && (
                                                <span className={`${msg.read ? 'text-blue-500' : 'text-slate-400'}`}>
                                                    {msg.read ? <CheckCheck size={14} /> : <Check size={14} />}
                                                </span>
                                            )}
                                        </div>

                                        {isMe ? (
                                             <svg className="absolute -right-2 top-0 w-2 h-3 text-[#d9fdd3] fill-current" viewBox="0 0 8 13"><path d="M-2.3,13H8V0H-2.3c-2.3,0-3.3,2.9-1.5,4.3L-2.3,13z"/></svg>
                                        ) : (
                                             <svg className="absolute -left-2 top-0 w-2 h-3 text-white fill-current transform scale-x-[-1]" viewBox="0 0 8 13"><path d="M-2.3,13H8V0H-2.3c-2.3,0-3.3,2.9-1.5,4.3L-2.3,13z"/></svg>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="bg-slate-100 px-4 py-3 border-t border-slate-200 z-10">
                        {isRecording ? (
                             <div className="flex items-center gap-4 max-w-4xl mx-auto w-full">
                                <button 
                                    onClick={() => stopRecording(false)} 
                                    className="p-3 bg-slate-200 text-red-500 rounded-full hover:bg-slate-300 transition-colors"
                                    title="Cancel"
                                >
                                    <Trash size={20} />
                                </button>
                                <div className="flex-1 bg-white rounded-xl border border-slate-200 p-3 flex items-center gap-3 animate-pulse">
                                    <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                                    <span className="text-slate-700 font-mono font-bold">{formatDuration(recordingDuration)}</span>
                                    <span className="text-xs text-slate-400 ml-auto">Recording...</span>
                                </div>
                                <button 
                                    onClick={() => stopRecording(true)} 
                                    className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-lg animate-bounce"
                                    title="Send Voice Message"
                                >
                                    <Send size={20} className="ml-0.5" />
                                </button>
                             </div>
                        ) : (
                            <form onSubmit={handleSend} className="flex items-end gap-3 max-w-4xl mx-auto w-full">
                                <input 
                                    type="file" 
                                    ref={imageInputRef} 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={handleImageUpload} 
                                />
                                <input 
                                    type="file" 
                                    ref={documentInputRef} 
                                    accept=".pdf,.doc,.docx,.txt" 
                                    className="hidden" 
                                    onChange={handleDocumentUpload} 
                                />
                                <button type="button" className="p-2 text-slate-500 hover:text-slate-700 transition-colors mb-1 hidden sm:block">
                                    <Smile size={24} />
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => documentInputRef.current?.click()}
                                    className="p-2 text-slate-500 hover:text-slate-700 transition-colors mb-1"
                                    title="Attach Document"
                                >
                                    <Paperclip size={24} />
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => imageInputRef.current?.click()}
                                    className="p-2 text-slate-500 hover:text-slate-700 transition-colors mb-1"
                                    title="Attach Image"
                                >
                                    <ImageIcon size={24} />
                                </button>
                                
                                <div className="flex-1 bg-white rounded-xl border border-white focus-within:border-slate-300 focus-within:ring-1 focus-within:ring-white transition-all shadow-sm flex items-center px-4 py-2">
                                    <input 
                                        className="w-full bg-transparent outline-none text-slate-800 placeholder-slate-400 max-h-32 py-1"
                                        placeholder="Type a secure message..."
                                        value={inputText}
                                        onChange={e => setInputText(e.target.value)}
                                    />
                                </div>

                                {inputText.trim() ? (
                                    <button 
                                        type="submit" 
                                        className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-md mb-1 transform active:scale-95"
                                    >
                                        <Send size={20} className="ml-0.5" />
                                    </button>
                                ) : (
                                     <button 
                                        type="button" 
                                        onClick={startRecording}
                                        className="p-3 bg-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors shadow-sm mb-1 transform active:scale-95 group"
                                        title="Record Audio"
                                    >
                                        <Mic size={20} className="group-hover:scale-110 transition-transform" />
                                    </button>
                                )}
                            </form>
                        )}
                    </div>
                 </>
             )}
          </div>
       </div>
    </div>
  );
};
