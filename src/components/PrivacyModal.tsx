import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { 
  exportLocalDataAsJSON, 
  clearLocalData 
} from '../services/storage.ts';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataCleared?: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [clearedSuccess, setClearedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExportData = () => {
    const jsonStr = exportLocalDataAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rr-news-local-backup-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (confirm('Clear all local news preferences, metrics, and saved articles?')) {
      clearLocalData();
      setClearedSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    }
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      
      <div className="bg-[#111726] backdrop-blur-2xl rounded-3xl max-w-md w-full border border-white/10 shadow-2xl p-6 space-y-5 text-white">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="headline-font text-lg font-bold text-white">
            Privacy & Data
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {clearedSuccess && (
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Local data cleared</span>
          </div>
        )}

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            <strong className="text-white">DuckDuckGo Search</strong>: Search queries are executed without recording your IP address or persistent search cookies.
          </p>
          <p>
            <strong className="text-white">Local Storage</strong>: Saved stories, reading time, and topic preferences remain solely on this device.
          </p>
          <p>
            <strong className="text-white">Google Calendar</strong>: Access tokens are held only in memory during your active session.
          </p>
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center gap-3">
          <button
            onClick={handleExportData}
            className="flex-1 py-2 px-3 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-medium cursor-pointer transition-colors"
          >
            Export Data (JSON)
          </button>

          <button
            onClick={handleClearData}
            className="py-2 px-3 rounded-lg text-rose-400 hover:bg-rose-950/40 border border-rose-500/20 text-xs font-medium cursor-pointer transition-colors"
          >
            Clear Local Data
          </button>
        </div>

      </div>

    </div>
  );
};
