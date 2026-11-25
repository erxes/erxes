import { formatInTimeZone } from 'date-fns-tz';

// `"Bob" <sip:99112233@pbx;transport=ws>` and a bare `99112233@pbx` both
// give `99112233`.
export const extractPhoneNumberFromCounterpart = (counterpart: string) => {
  if (!counterpart) return '';
  const sipUser = counterpart.match(/sips?:([^@;>\s]+)@/i);
  if (sipUser) return sipUser[1];
  return counterpart.match(/^\s*<?([^@;>\s<:]+)@/)?.[1] ?? '';
};

interface ISipMessageWithHeaders {
  getHeader: (name: string) => string | undefined;
}

const hasHeaders = (message: unknown): message is ISipMessageWithHeaders =>
  typeof message === 'object' &&
  message !== null &&
  'getHeader' in message &&
  typeof message.getHeader === 'function';

export const isCallCompletedElsewhere = (message: unknown): boolean => {
  if (!hasHeaders(message)) return false;
  const reason = (message.getHeader('Reason') || '').toLowerCase();
  return reason.includes('cause=200') || reason.includes('completed elsewhere');
};

export const logger = {
  log: (a: any) => {
    // intentionally empty in production
  },
  error: (e: any) => {
    console.error(e, 'error');
  },
  warn: (w: any) => {
    console.warn(w, 'warn');
  },
  debug: (d: any, e?: any) => {
    // intentionally empty in production
  },
};

export function formatSeconds(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [hrs, mins, secs].map((v) => String(v).padStart(2, '0')).join(':');
}

export function safeFormatDate(value: unknown, fmt = 'MM-dd HH:mm'): string {
  const timeZone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Ulaanbaatar';

  if (value === '0000-00-00 00:00:00') {
    return '0000-00-00 00:00:00';
  }

  if (!value) {
    return '-';
  }

  const date = new Date(value as string | number | Date);
  if (isNaN(date.getTime())) {
    return '-';
  }

  return formatInTimeZone(date, timeZone, fmt);
}

export const renderFullName = (data: any, noPhone?: boolean) => {
  if (data.firstName || data.lastName || data.middleName || data.primaryPhone) {
    return (
      (data.firstName || '') +
      ' ' +
      (data.middleName || '') +
      ' ' +
      (data.lastName || '') +
      ' ' +
      ((!noPhone && data.primaryPhone) || '')
    );
  }

  if (data.primaryEmail || data.primaryPhone) {
    return data.primaryEmail || data.primaryPhone;
  }

  if (data.emails && data.emails.length > 0) {
    return data.emails[0]?.email || 'Unknown';
  }

  if (data.phones && data.phones.length > 0) {
    return data.phones[0]?.phone || 'Unknown';
  }

  const { visitorContactInfo } = data;

  if (visitorContactInfo) {
    return visitorContactInfo.phone || visitorContactInfo.email || 'Unknown';
  }

  return 'Unknown';
};
