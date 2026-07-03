import React, { useEffect, useState } from 'react';
import { Lock, CheckCircle, ExternalLink } from 'lucide-react';
import { hasApiKey, requestApiKey } from '../services/geminiService';

interface ApiKeySelectorProps {
  onKeySelected: () => void;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
  const [hasKey, setHasKey] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkKey = async () => {
    try {
      const selected = await hasApiKey();
      setHasKey(selected);
      if (selected) {
        onKeySelected();
      }
    } catch (e) {
      console.error("Error checking API key:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelection = async () => {
    try {
      await requestApiKey();
      // Assume success as per instructions and re-check immediately
      await checkKey();
    } catch (e) {
      console.error("Error selecting API key", e);
    }
  };

  if (loading) return null;

  if (hasKey) {
    return (
      <div className="flex items-center gap-2 text-emerald-400 bg-emerald-950/30 px-3 py-1.5 rounded-full border border-emerald-500/20 text-sm">
        <CheckCircle size={14} />
        <span>API Key Active</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-3 p-4 bg-slate-800 rounded-lg border border-slate-700 shadow-xl max-w-sm">
      <div className="flex items-center gap-2 text-slate-100 font-medium">
        <Lock className="text-amber-400" size={20} />
        <span>Veo requires a paid API key</span>
      </div>
      <p className="text-slate-400 text-sm">
        To use the Veo video generation model, you need to select a project with billing enabled.
      </p>
      <div className="flex gap-3 w-full">
         <button
          onClick={handleSelection}
          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Select Project
        </button>
        <a 
          href="https://ai.google.dev/gemini-api/docs/billing" 
          target="_blank" 
          rel="noreferrer"
          className="flex items-center justify-center gap-1 px-3 py-2 text-slate-400 hover:text-white transition-colors text-sm"
        >
          Docs <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
};

export default ApiKeySelector;