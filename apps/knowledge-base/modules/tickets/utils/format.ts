/**
 * The ticket body carries the reporter's contact line appended after the
 * message. It is written by `TicketForm` and split back out for display here,
 * so both sides share this one marker.
 */
export const CONTACT_MARKER = '— Холбоо барих: ';

export const buildTicketBody = (message: string, contact: string): string =>
  contact ? `${message}\n\n${CONTACT_MARKER}${contact}` : message;

export const splitTicketBody = (
  description: string | null,
): { message: string; contact: string | null } => {
  const text = description?.trim() ?? '';
  const at = text.lastIndexOf(CONTACT_MARKER);

  if (at === -1) {
    return { message: text, contact: null };
  }

  return {
    message: text.slice(0, at).trim(),
    contact: text.slice(at + CONTACT_MARKER.length).trim() || null,
  };
};

export const formatDateTime = (value: string | null): string => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
};
