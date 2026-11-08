import { getAccessToken, requestCalendarAccess } from './firebase.ts';
import { CalendarEventPayload, CalendarSyncedEvent } from '../types/news.ts';

const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

export async function createGoogleCalendarEvent(payload: CalendarEventPayload): Promise<CalendarSyncedEvent> {
  let token = await getAccessToken();
  if (!token) {
    token = await requestCalendarAccess();
  }
  if (!token) {
    throw new Error('Google Calendar access permission is required. Please grant calendar permission to schedule reading slots.');
  }

  const response = await fetch(CALENDAR_API_BASE, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      summary: payload.summary,
      description: payload.description,
      start: {
        dateTime: payload.startDateTime,
      },
      end: {
        dateTime: payload.endDateTime,
      },
      location: payload.location || 'R.R NEWS Reader App',
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 15 },
          { method: 'email', minutes: 60 }
        ]
      }
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to create calendar event (${response.status})`);
  }

  const data = await response.json();
  return {
    id: data.id,
    title: data.summary,
    startDateTime: data.start?.dateTime || payload.startDateTime,
    endDateTime: data.end?.dateTime || payload.endDateTime,
    htmlLink: data.htmlLink,
  };
}

export async function listUpcomingNewsEvents(): Promise<CalendarSyncedEvent[]> {
  const token = await getAccessToken();
  if (!token) {
    return [];
  }

  const now = new Date().toISOString();
  const url = `${CALENDAR_API_BASE}?timeMin=${encodeURIComponent(now)}&maxResults=15&singleEvents=true&orderBy=startTime`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('Failed to fetch calendar events:', response.status);
      return [];
    }

    const data = await response.json();
    return (data.items || []).map((item: any) => ({
      id: item.id,
      title: item.summary || 'Scheduled Event',
      startDateTime: item.start?.dateTime || item.start?.date || '',
      endDateTime: item.end?.dateTime || item.end?.date || '',
      htmlLink: item.htmlLink,
    }));
  } catch (err) {
    console.error('Error fetching calendar events:', err);
    return [];
  }
}

export async function deleteGoogleCalendarEvent(eventId: string): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('User is not authenticated with Google Calendar.');
  }

  const response = await fetch(`${CALENDAR_API_BASE}/${encodeURIComponent(eventId)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok && response.status !== 404 && response.status !== 410) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to delete calendar event (${response.status})`);
  }

  return true;
}
