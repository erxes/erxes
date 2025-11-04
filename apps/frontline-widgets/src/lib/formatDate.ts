import { format, isToday, isYesterday, isThisYear, subDays } from 'date-fns';

export function formatMessageDate(date: string | Date): string {
  const messageDate = new Date(date);
  const today = new Date();

  if (isToday(messageDate)) {
    return 'Today';
  }

  if (isYesterday(messageDate)) {
    return 'Yesterday';
  }

  // Check if it's within the last 7 days (more like FB Messenger)
  const weekAgo = subDays(today, 7);
  if (messageDate >= weekAgo && messageDate < today) {
    return format(messageDate, 'EEEE'); // Day of week (Monday, Tuesday, etc.)
  }

  if (isThisYear(messageDate)) {
    return format(messageDate, 'MMM d'); // Jan 15, Feb 3, etc.
  }

  return format(messageDate, 'MMM d, yyyy'); // Jan 15, 2023, etc.
}

export function getDateKey(date: string | Date): string {
  const messageDate = new Date(date);
  return format(messageDate, 'yyyy-MM-dd');
}
