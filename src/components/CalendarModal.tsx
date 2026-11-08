import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  ExternalLink,
  Plus
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Article, CalendarSyncedEvent } from '../types/news.ts';
import { 
  createGoogleCalendarEvent, 
  listUpcomingNewsEvents, 
  deleteGoogleCalendarEvent 
} from '../services/calendar.ts';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  article?: Article | null;
  user: User | null;
  onGoogleSignIn: () => void;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  onClose,
  article,
  user,
  onGoogleSignIn,
}) => {
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('09:00');
  const [durationMinutes, setDurationMinutes] = useState(30);

  const [syncedEvents, setSyncedEvents] = useState<CalendarSyncedEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Mandatory confirmation step (Google Workspace Skill)
  const [pendingConfirmAction, setPendingConfirmAction] = useState<{
    type: 'create' | 'delete';
    title: string;
    details: string;
    payload?: any;
    eventId?: string;
  } | null>(null);

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

  useEffect(() => {
    if (!isOpen) return;

    const now = new Date();
    if (now.getHours() >= 18) {
      now.setDate(now.getDate() + 1);
    }
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    setEventDate(`${yyyy}-${mm}-${dd}`);

    if (article) {
      setEventTitle(`Read: ${article.title}`);
    } else {
      setEventTitle('Daily News Reading');
    }

    if (user) {
      loadCalendarEvents();
    }
  }, [isOpen, article, user]);

  const loadCalendarEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const items = await listUpcomingNewsEvents();
      setSyncedEvents(items);
    } catch (e: any) {
      console.warn('Failed to load events', e);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  if (!isOpen) return null;

  const handleRequestCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDate || !eventTime) return;

    const startIso = `${eventDate}T${eventTime}:00`;
    const startDateObj = new Date(startIso);
    const endDateObj = new Date(startDateObj.getTime() + durationMinutes * 60000);

    setPendingConfirmAction({
      type: 'create',
      title: 'Confirm Calendar Event',
      details: `Add "${eventTitle}" to your Google Calendar on ${startDateObj.toLocaleDateString()} at ${startDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}?`,
      payload: {
        summary: eventTitle,
        description: article ? `${article.summary}\n\nLink: ${article.sourceUrl || ''}` : 'Reading session scheduled from R.R NEWS',
        startDateTime: startDateObj.toISOString(),
        endDateTime: endDateObj.toISOString(),
      }
    });
  };

  const handleRequestDelete = (item: CalendarSyncedEvent) => {
    setPendingConfirmAction({
      type: 'delete',
      title: 'Delete Calendar Event',
      details: `Delete "${item?.title || 'Event'}" from your Google Calendar?`,
      eventId: item.id
    });
  };

  const handleExecuteConfirmedAction = async () => {
    if (!pendingConfirmAction) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setActionSuccessMessage(null);

    try {
      if (pendingConfirmAction.type === 'create') {
        const created = await createGoogleCalendarEvent(pendingConfirmAction.payload);
        setActionSuccessMessage(`Scheduled "${created?.title || 'Event'}"`);
        await loadCalendarEvents();
      } else if (pendingConfirmAction.type === 'delete' && pendingConfirmAction.eventId) {
        await deleteGoogleCalendarEvent(pendingConfirmAction.eventId);
        setActionSuccessMessage('Event deleted');
        setSyncedEvents(prev => prev.filter(e => e.id !== pendingConfirmAction.eventId));
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Action failed.');
    } finally {
      setIsSubmitting(false);
      setPendingConfirmAction(null);
    }
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      
      <div className="bg-[#111726] backdrop-blur-2xl rounded-3xl max-w-lg w-full border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-white">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 bg-[#151c2b] backdrop-blur-md flex items-center justify-between">
          <h2 className="headline-font text-lg font-bold text-white">
            Schedule in Google Calendar
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {actionSuccessMessage && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{actionSuccessMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!user ? (
            <div className="py-8 text-center space-y-4">
              <p className="text-xs text-slate-300 max-w-xs mx-auto">
                Sign in with your Google account to add reading reminders to your calendar.
              </p>
              <div>
                <button
                  onClick={onGoogleSignIn}
                  className="gsi-material-button shadow-sm"
                >
                  <div className="gsi-material-button-state"></div>
                  <div className="gsi-material-button-content-wrapper">
                    <div className="gsi-material-button-icon">
                      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                        <path fill="none" d="M0 0h48v48H0z"></path>
                      </svg>
                    </div>
                    <span className="gsi-material-button-contents">Sign in with Google</span>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRequestCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Length
                  </label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  >
                    <option value={15}>15m</option>
                    <option value={30}>30m</option>
                    <option value={45}>45m</option>
                    <option value={60}>1h</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 shadow-md"
              >
                Schedule Event
              </button>
            </form>
          )}

          {user && (
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Upcoming Scheduled Reading</span>
                <button onClick={loadCalendarEvents} className="hover:text-white cursor-pointer">
                  Refresh
                </button>
              </div>

              {isLoadingEvents ? (
                <p className="text-xs text-slate-400 py-2">Loading...</p>
              ) : syncedEvents.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">No scheduled events</p>
              ) : (
                <div className="space-y-1.5">
                  {syncedEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="truncate pr-2">
                        <p className="font-medium text-slate-200 truncate">{evt?.title || 'Scheduled Event'}</p>
                        <p className="text-[11px] text-slate-400">
                          {new Date(evt.startDateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {evt.htmlLink && (
                          <a
                            href={evt.htmlLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => handleRequestDelete(evt)}
                          className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Mandatory User Confirmation Dialog */}
      {pendingConfirmAction && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#151c2b] rounded-xl max-w-sm w-full p-5 border border-slate-700 shadow-2xl space-y-3 text-white">
            <h3 className="text-sm font-bold text-white">
              {pendingConfirmAction.title}
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              {pendingConfirmAction.details}
            </p>

            <div className="pt-2 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPendingConfirmAction(null)}
                className="px-3 py-1.5 rounded text-slate-300 hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleExecuteConfirmedAction}
                className="px-3.5 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold cursor-pointer shadow-xs"
              >
                {isSubmitting ? 'Updating...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
