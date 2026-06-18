import { formatTimeZoneLabel } from 'erxes-ui';

interface OnlineHour {
  day: string;
  from: string;
  to: string;
}

interface FormatOnlineHoursOptions {
  onlineHours?: OnlineHour[];
  timezone?: string;
  showTimezone?: boolean;
}

/**
 * Parses a time string and converts it to 12-hour format
 * Handles formats like "09:00", "9:00", "9:00 am", "9:00 pm"
 */
function parseTime(timeString: string): { hour: number; minute: number } {
  const normalized = timeString.toLowerCase().trim();
  const colonIndex = normalized.indexOf(':');

  if (colonIndex === -1) {
    throw new Error(`Invalid time format: ${timeString}`);
  }

  let hour = Number.parseInt(normalized.substring(0, colonIndex), 10);
  const minute = Number.parseInt(
    normalized.substring(colonIndex + 1, colonIndex + 3),
    10,
  );

  const isPM = normalized.includes('pm');
  const isAM = normalized.includes('am');

  // If already in 12-hour format (has am/pm), convert to 24-hour first
  if (isPM && hour !== 12) {
    hour += 12;
  } else if (isAM && hour === 12) {
    hour = 0;
  }

  return { hour, minute };
}

/**
 * Formats a time to 12-hour format with dot separator (e.g., "9.00 am", "6.00 pm")
 */
function formatTimeTo12Hour(timeString: string): string {
  const { hour, minute } = parseTime(timeString);
  const hour12 = hour > 12 ? hour - 12 : hour || 12;
  const period = hour < 12 ? 'am' : 'pm';
  const minuteStr = minute.toString().padStart(2, '0');

  return `${hour12}.${minuteStr} ${period}`;
}

/**
 * Formats online hours to a readable text string
 * @example "We're available between 9.00 am and 6.00 pm (GMT +8)."
 */
export function formatOnlineHours({
  onlineHours,
  timezone,
  showTimezone,
}: FormatOnlineHoursOptions): {
  result: string;
  workHours: string;
  formatedTimeZone: string;
  onlineDays: string;
} {
  // Safe fallback object for early exits and errors
  const emptyResult = {
    result: '',
    workHours: '',
    formatedTimeZone: '',
    onlineDays: '',
  };

  if (!onlineHours || onlineHours.length === 0) {
    return emptyResult;
  }

  const firstHour = onlineHours[0];

  if (!firstHour?.from || !firstHour?.to) {
    return emptyResult;
  }

  try {
    const formattedFrom = formatTimeTo12Hour(firstHour.from);
    const formattedTo = formatTimeTo12Hour(firstHour.to);

    const workHours = `${formattedFrom} and ${formattedTo}`;
    let formatedTimeZone = '';
    let result = `${formattedFrom} and ${formattedTo}`;

    if (showTimezone && timezone) {
      const timezoneLabel = formatTimeZoneLabel(timezone);
      // Extract GMT offset from timezone label (e.g., "(GMT+08:00)" -> "GMT +8")
      const gmtMatch = timezoneLabel.match(/\(GMT([+-])(\d{1,2}):?(\d{0,2})\)/);

      if (gmtMatch) {
        const sign = gmtMatch[1] === '+' ? '+' : '-';
        const hours = Number.parseInt(gmtMatch[2], 10);
        const minutes = gmtMatch[3] ? Number.parseInt(gmtMatch[3], 10) : 0;

        const tzString =
          minutes === 0
            ? ` (GMT ${sign}${hours})`
            : ` (GMT ${sign}${hours}:${minutes.toString().padStart(2, '0')})`;

        result += tzString;
        formatedTimeZone = tzString.trim(); // Populates formatedTimeZone for GMT matches
      } else {
        const fallbackTz = ` (${timezoneLabel})`;
        result += fallbackTz;
        formatedTimeZone = fallbackTz.trim();
      }
    }

    const onlineDays = onlineHours.map((item) => item.day).join(', ');
    result += `, ${onlineDays}.`;

    return {
      result,
      workHours,
      formatedTimeZone,
      onlineDays,
    };
  } catch (error) {
    // Fallback object structure if formatting throws an exception
    const fallbackTz =
      showTimezone && timezone ? ` (${formatTimeZoneLabel(timezone)})` : '';

    return {
      result: `We're available between <b>${firstHour.from} and ${firstHour.to}</b>${fallbackTz}`,
      workHours: `${firstHour.from} and ${firstHour.to}`,
      formatedTimeZone: fallbackTz.trim(),
      onlineDays: onlineHours.map((item) => item.day).join(', '),
    };
  }
}
export function formatOnlineHoursShort({
  onlineHours,
  timezone,
  showTimezone,
}: FormatOnlineHoursOptions): string {
  const firstHour = onlineHours?.[0];
  if (!firstHour?.from || !firstHour?.to) return '';

  try {
    // 1. Get clean lowercase times (e.g., "9.00 am" -> "9am")
    const from = formatTimeTo12Hour(firstHour.from)
      .replace(/\s+/g, '')
      .replace('.00', '');
    const to = formatTimeTo12Hour(firstHour.to)
      .replace(/\s+/g, '')
      .replace('.00', '');

    // 2. Parse compact Timezone
    let tzSuffix = '';
    if (showTimezone && timezone) {
      const label = formatTimeZoneLabel(timezone);
      const match = label.match(/\(GMT([+-])(\d{1,2}):?(\d{0,2})\)/);

      if (match) {
        const [_, sign, hrs, mins] = match;
        const m = mins ? parseInt(mins, 10) : 0;
        const formattedMins =
          m === 0 ? '' : `:${m.toString().padStart(2, '0')}`;
        tzSuffix = ` (GMT${sign}${parseInt(hrs, 10)}${formattedMins})`;
      }
    }

    return `${from}-${to}${tzSuffix}`;
  } catch {
    return `${firstHour.from}-${firstHour.to}`;
  }
}
