import React from 'react';
import { Loader2, Film } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible, message = "Generating..." }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm">
      <div className="flex flex-col items-center p-8 bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl max-w-md w-full mx-4">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
          <div className="relative bg-slate-800 p-4 rounded-full border border-slate-700">
             <Film className="w-8 h-8 text-blue-400" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-1 border border-slate-700">
             <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">Creating Video</h3>
        <p className="text-slate-400 text-center mb-6">
          {message}
        </p>
        
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 animate-progress origin-left"></div>
        </div>
        <p className="text-xs text-slate-500 mt-3">This may take a minute or two...</p>
      </div>
      
      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 95%; }
        }
        .animate-progress {
          animation: progress 60s cubic-bezier(0.1, 0.7, 1.0, 0.1) forwards;
        }
      `}</style>
    </div>
  );
};

export default LoadingOverlay;