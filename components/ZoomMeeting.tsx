
import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../services/mockStore';
import { Mic, MicOff, Video, VideoOff, Users, MessageSquare, MonitorUp, PhoneOff, MoreHorizontal, Smile, ShieldCheck, ChevronUp, Circle, LayoutGrid, Maximize, Lock, Check, Shield } from 'lucide-react';

interface ZoomMeetingProps {
    onClose: () => void;
}

export const ZoomMeeting: React.FC<ZoomMeetingProps> = ({ onClose }) => {
    const { admins, currentUser } = useStore();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [showParticipants, setShowParticipants] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [isConnecting, setIsConnecting] = useState(true);
    const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Simulate connecting state
    useEffect(() => {
        const timer = setTimeout(() => setIsConnecting(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    // Update time
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Camera handling
    useEffect(() => {
        let stream: MediaStream | null = null;

        const startCamera = async () => {
            if (isVideoOn && !isConnecting) {
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                } catch (err) {
                    console.error("Error accessing camera:", err);
                    setIsVideoOn(false); // Turn off video state if permission denied
                    alert("Unable to access camera. Please check permissions.");
                }
            }
        };

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isVideoOn, isConnecting]);

    // Simulate random active speakers
    useEffect(() => {
        const timer = setInterval(() => {
            const participants = admins.filter(a => a.role === 'CITY_ADMIN');
            if (participants.length > 0 && Math.random() > 0.6) {
                const randomSpeaker = participants[Math.floor(Math.random() * participants.length)];
                setActiveSpeakerId(randomSpeaker.id);
            } else {
                setActiveSpeakerId(null);
            }
        }, 3000);
        return () => clearInterval(timer);
    }, [admins]);

    const participants = admins.filter(a => a.role === 'CITY_ADMIN').map(a => ({
        ...a,
        isMuted: false, // In a real app, this would be dynamic state
        isVideoOn: true
    }));

    const myRoleLabel = currentUser?.role === 'SUPER_ADMIN' ? 'Super Admin' : currentUser?.role === 'CITY_ADMIN' ? 'City Admin' : 'User';

    if (isConnecting) {
        return (
            <div className="fixed inset-0 z-[200] bg-[#1a1a1a] flex flex-col items-center justify-center text-white">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                <h2 className="text-xl font-medium">Connecting to Secure Meeting...</h2>
                <p className="text-gray-400 text-sm mt-2">Verifying Encryption Keys</p>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[200] bg-[#1a1a1a] text-white flex flex-col font-sans overflow-hidden">
            {/* Top Bar - Fixed Height */}
            <div className="h-14 flex justify-between items-center px-4 bg-[#1a1a1a] border-b border-[#333] shrink-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="bg-green-500/10 text-green-500 p-1.5 rounded-full">
                        <ShieldCheck size={18} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-200 flex items-center gap-2">
                            National Security Briefing <Lock size={12} className="text-green-500"/>
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">ID: 892-123-4567 • ENCRYPTED</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-[#242424] px-3 py-1 rounded text-xs font-medium text-gray-300">
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="bg-[#242424] p-1.5 rounded text-gray-300 cursor-pointer hover:bg-[#333] transition-colors">
                        <LayoutGrid size={18} />
                    </div>
                    <div className="bg-[#242424] p-1.5 rounded text-gray-300 cursor-pointer hover:bg-[#333] transition-colors">
                        <Maximize size={18} />
                    </div>
                </div>
            </div>

            {/* Main Content Container - Flexible Height with min-h-0 to prevent overflow issues */}
            <div className="flex-1 relative flex overflow-hidden min-h-0">
                
                {/* Scrollable Meeting Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center p-4 gap-6 bg-[#121212]">
                    
                    {/* 1. Super Admin (Me) - Prominent Top Position */}
                    {/* Using viewport height unit (vh) ensures it leaves room for the grid below regardless of screen size */}
                    <div className="shrink-0 flex flex-col items-center w-full animate-in slide-in-from-top-4 duration-500">
                        <div className="relative h-[45vh] aspect-video bg-[#242424] rounded-2xl overflow-hidden border border-[#333] shadow-2xl ring-1 ring-white/5 group">
                            {isVideoOn ? (
                                <video 
                                    ref={videoRef} 
                                    autoPlay 
                                    muted 
                                    playsInline 
                                    className="w-full h-full object-cover transform scale-x-[-1]" 
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#2a2a2a]">
                                    {(currentUser as any)?.photoUrl ? (
                                        <img 
                                            src={(currentUser as any).photoUrl} 
                                            className="w-full h-full object-cover opacity-60" 
                                            alt="Me" 
                                        />
                                    ) : (
                                        <div className="w-32 h-32 rounded-full bg-[#333] flex items-center justify-center text-4xl font-bold text-gray-500">
                                            {(currentUser as any)?.name?.charAt(0) || 'Me'}
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {/* Host Label Overlay */}
                            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border border-white/10 shadow-lg">
                                {isMuted ? <MicOff size={14} className="text-red-500" /> : <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></div>}
                                <span className="text-white">You ({myRoleLabel})</span>
                                <span className="bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Host</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. City Admins - Centered Grid Below */}
                    <div className="w-full max-w-[1600px] flex flex-wrap justify-center gap-3 pb-10">
                        {participants.map((p, idx) => (
                            <div 
                                key={p.id} 
                                className={`relative w-64 aspect-video bg-[#242424] rounded-xl overflow-hidden border transition-all duration-300 group ${
                                    activeSpeakerId === p.id 
                                        ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)] ring-1 ring-green-500' 
                                        : 'border-[#333] hover:border-[#444] hover:shadow-xl'
                                }`}
                            >
                                <img 
                                    src={p.photoUrl || `https://loremflickr.com/400/400/portrait?random=${idx}`} 
                                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
                                    alt={p.name} 
                                />
                                
                                {/* Status Overlay */}
                                <div className="absolute top-2 right-2">
                                    {activeSpeakerId === p.id && (
                                        <div className="flex items-center gap-1 bg-green-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                            <div className="flex gap-0.5 h-2 items-end">
                                                <div className="w-0.5 h-full bg-black animate-pulse"></div>
                                                <div className="w-0.5 h-1/2 bg-black animate-pulse delay-75"></div>
                                                <div className="w-0.5 h-full bg-black animate-pulse delay-150"></div>
                                            </div>
                                            Speaking
                                        </div>
                                    )}
                                </div>

                                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 border border-white/5">
                                    {activeSpeakerId !== p.id ? <MicOff size={12} className="text-red-500" /> : <Mic size={12} className="text-green-500" />}
                                    <span className="text-gray-200 truncate max-w-[140px]">{p.name}</span>
                                    <span className="text-[9px] text-gray-400 bg-white/10 px-1 rounded">{p.assignedCity || 'City Admin'}</span>
                                </div>
                            </div>
                        ))}
                        
                        {participants.length === 0 && (
                            <div className="w-full py-8 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-[#333] rounded-2xl bg-[#1a1a1a]">
                                <Users size={24} className="mb-2 opacity-30" />
                                <p className="text-xs">Waiting for participants...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar (Participants/Chat) - Conditional Render */}
                {(showParticipants || showChat) && (
                    <div className="w-80 bg-[#1a1a1a] border-l border-[#333] flex flex-col shrink-0 z-20 shadow-2xl transition-all animate-in slide-in-from-right duration-300">
                        <div className="flex border-b border-[#333]">
                            {showParticipants && (
                                <div className="flex-1 p-4 font-bold text-sm text-center border-b-2 border-blue-500 text-blue-400">
                                    Participants ({participants.length + 1})
                                </div>
                            )}
                            {showChat && (
                                <div className="flex-1 p-4 font-bold text-sm text-center border-b-2 border-blue-500 text-blue-400">
                                    Meeting Chat
                                </div>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {showParticipants && (
                                <div className="space-y-1">
                                    {/* Me in List */}
                                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[#242424] transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold overflow-hidden border border-blue-400">
                                                {(currentUser as any)?.photoUrl ? <img src={(currentUser as any).photoUrl} className="w-full h-full object-cover"/> : "Me"}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-200">Me (Host)</span>
                                                <span className="text-[10px] text-gray-500">{myRoleLabel}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 text-gray-400">
                                            {isMuted ? <MicOff size={14} className="text-red-500" /> : <Mic size={14} />}
                                            {isVideoOn ? <Video size={14} /> : <VideoOff size={14} className="text-red-500" />}
                                        </div>
                                    </div>
                                    
                                    <div className="h-px bg-[#333] my-2"></div>

                                    {/* Others */}
                                    {participants.map(p => (
                                        <div key={p.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-[#242424] transition-colors">
                                            <div className="flex items-center gap-3">
                                                <img src={p.photoUrl || `https://loremflickr.com/100/100/portrait`} className="w-8 h-8 rounded-full object-cover border border-[#444]" />
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-gray-300">{p.name}</span>
                                                    <span className="text-[10px] text-gray-500">{p.assignedCity}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 text-gray-400">
                                                {activeSpeakerId === p.id ? <Mic size={14} className="text-green-500" /> : <MicOff size={14} className="text-red-500" />}
                                                <Video size={14} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {showChat && (
                                <div className="h-full flex flex-col justify-center items-center text-gray-500 text-sm">
                                    <div className="w-16 h-16 bg-[#242424] rounded-full flex items-center justify-center mb-4">
                                        <Shield size={32} className="opacity-50" />
                                    </div>
                                    <p className="font-bold text-gray-400">Encrypted Channel</p>
                                    <p className="text-xs text-center mt-2 max-w-[200px]">Chat history is disabled for this high-security briefing.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Toolbar - Fixed Height */}
            <div className="h-20 bg-[#1a1a1a] border-t border-[#333] flex justify-between items-center px-6 shrink-0 z-20">
                {/* Audio/Video Controls */}
                <div className="flex gap-4">
                    <button 
                        onClick={() => setIsMuted(!isMuted)}
                        className="flex flex-col items-center gap-1 min-w-[60px] group"
                    >
                        <div className={`p-3 rounded-xl transition-all duration-200 ${isMuted ? 'bg-red-500/20 text-red-500' : 'text-gray-300 group-hover:bg-[#333] group-hover:text-white'}`}>
                            {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                            {isMuted ? 'Unmute' : 'Mute'} <ChevronUp size={8} />
                        </div>
                    </button>

                    <button 
                        onClick={() => setIsVideoOn(!isVideoOn)}
                        className="flex flex-col items-center gap-1 min-w-[60px] group"
                    >
                        <div className={`p-3 rounded-xl transition-all duration-200 ${!isVideoOn ? 'bg-red-500/20 text-red-500' : 'text-gray-300 group-hover:bg-[#333] group-hover:text-white'}`}>
                            {!isVideoOn ? <VideoOff size={22} /> : <Video size={22} />}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                            {!isVideoOn ? 'Start Video' : 'Stop Video'} <ChevronUp size={8} />
                        </div>
                    </button>
                </div>

                {/* Center Controls */}
                <div className="flex gap-2">
                    <button className="flex flex-col items-center gap-1 min-w-[60px] group" onClick={() => setShowParticipants(!showParticipants)}>
                        <div className={`p-3 rounded-xl transition-all duration-200 ${showParticipants ? 'bg-[#333] text-blue-400' : 'text-gray-300 group-hover:bg-[#333] group-hover:text-white'}`}>
                            <Users size={22} />
                            {participants.length > 0 && (
                                <span className="absolute top-2 ml-4 bg-red-500 text-white text-[9px] px-1.5 rounded-full border border-[#1a1a1a]">{participants.length + 1}</span>
                            )}
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium">Participants</span>
                    </button>

                    <button className="flex flex-col items-center gap-1 min-w-[60px] group" onClick={() => setShowChat(!showChat)}>
                        <div className={`p-3 rounded-xl transition-all duration-200 ${showChat ? 'bg-[#333] text-blue-400' : 'text-gray-300 group-hover:bg-[#333] group-hover:text-white'}`}>
                            <MessageSquare size={22} />
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium">Chat</span>
                    </button>

                    <button 
                        className="flex flex-col items-center gap-1 min-w-[60px] group"
                        onClick={() => setIsScreenSharing(!isScreenSharing)}
                    >
                        <div className={`p-3 rounded-xl transition-all duration-200 ${isScreenSharing ? 'bg-green-500/20 text-green-500' : 'text-green-500 group-hover:bg-[#333] group-hover:bg-green-500/10'}`}>
                            <MonitorUp size={22} />
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium">{isScreenSharing ? 'Stop Share' : 'Share Screen'}</span>
                    </button>

                    <button className="flex flex-col items-center gap-1 min-w-[60px] group">
                        <div className="p-3 rounded-xl transition-all duration-200 text-gray-300 group-hover:bg-[#333] group-hover:text-white">
                            <Circle size={22} />
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium">Record</span>
                    </button>

                    <button className="flex flex-col items-center gap-1 min-w-[60px] group">
                        <div className="p-3 rounded-xl transition-all duration-200 text-gray-300 group-hover:bg-[#333] group-hover:text-white">
                            <Smile size={22} />
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium">Reactions</span>
                    </button>
                </div>

                {/* End Call */}
                <div>
                    <button 
                        onClick={onClose}
                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-600/20 hover:scale-105 active:scale-95"
                    >
                        End Meeting
                    </button>
                </div>
            </div>
        </div>
    );
};
