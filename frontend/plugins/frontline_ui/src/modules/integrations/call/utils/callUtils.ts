import { CallDirectionEnum } from '@/integrations/call/types/sipTypes';
import { formatInTimeZone } from 'date-fns-tz';

export const extractPhoneNumberFromCounterpart = (counterpart: string) => {
  if (!counterpart) return '';
  const startIndex = counterpart.indexOf(':') + 1;
  const endIndex = counterpart.indexOf('@');
  if (startIndex >= endIndex || startIndex === -1 || endIndex === -1) return '';
  return counterpart.slice(startIndex, endIndex);
};

export function parseCallDirection(
  direction: string | null,
): CallDirectionEnum {
  if (!direction) return CallDirectionEnum.OUTGOING;
  const parts = direction.split('/');
  if (parts.length > 1) {
    return parts[1].toLowerCase() as CallDirectionEnum;
  }
  return direction.toLowerCase() as CallDirectionEnum;
}



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
    return formatInTimeZone(new Date(), timeZone, fmt);
  }

  const date = new Date(value as string | number | Date);
  if (isNaN(date.getTime())) {
    return formatInTimeZone(new Date(), timeZone, fmt);
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
