import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { NotificationItem } from '../types/news.ts';

interface PushNotificationToastProps {
  notification: NotificationItem | null;
  onClose: () => void;
  onClick: (articleId?: string, item?: NotificationItem) => void;
  audioAlertsEnabled?: boolean;
}

export const PushNotificationToast: React.FC<PushNotificationToastProps> = ({
  notification,
  onClose,
  onClick,
}) => {
  useEffect(() => {
    if (!notification) return;

    // Silent dismiss timer (7s)
    const timer = setTimeout(() => {
      onClose();
    }, 7000);

    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  return (
    <div className="fixed top-16 sm:top-20 right-4 sm:right-6 z-[60] max-w-sm w-[calc(100vw-2rem)] sm:w-96 animate-in slide-in-from-top-3 duration-200">
      <div 
        onClick={() => onClick(notification.articleId, notification)}
        className="bg-[#151c2b] rounded-2xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.7)] border border-cyan-500/30 hover:border-cyan-400/60 transition-all cursor-pointer relative group backdrop-blur-xl"
      >
        <div className="pr-6 space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
            <span className="font-bold text-cyan-400 uppercase tracking-wider text-[10px]">
              {notification.category || 'Breaking'}
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-400">Live Alert</span>
          </div>

          <h4 className="headline-font text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-cyan-200 transition-colors">
            {notification.title}
          </h4>
          {notification.summary && (
            <p className="text-xs text-slate-300 line-clamp-1">
              {notification.summary}
            </p>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-3 right-3 p-1 text-slate-400 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/10"
          title="Dismiss"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
