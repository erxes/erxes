import { formatTimeZoneLabel } from 'erxes-ui';

export type OnlineHour = {
  day: string;
  from: string;
  to: string;
};

/**
 * Capitalizes the first letter of a string.
 */
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

/**
 * Converts varying time strings (e.g., "09:00:00", "18:00:00", "9:00 PM")
 * into a standardized "9.00 am" format.
 */
function parseTime(timeStr: string): string {
  const [time, modifier] = timeStr.trim().split(' ');
  const [hoursStr, minutesStr] = time.split(':');

  let hours = parseInt(hoursStr, 10);
  const minutes = minutesStr || '00';
  let ampm = modifier ? modifier.toLowerCase() : '';

  // If no AM/PM modifier is provided, assume it's a 24-hour format (like "18:00:00")
  if (!ampm) {
    ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12; // Convert 0 to 12 for midnight
  }

  return `${hours}.${minutes} ${ampm}`;
}

const DAY_ORDER = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

/**
 * Formats an array of day strings into human-readable lists, ranges, or keywords.
 */
function formatDays(days: string[]): string {
  const lowerDays = Array.from(new Set(days.map((d) => d.toLowerCase()))); // Deduplicate

  if (lowerDays.includes('everyday')) return 'everyday';

  const hasWeekdays = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
  ].every((d) => lowerDays.includes(d));
  const hasWeekends = ['saturday', 'sunday'].every((d) =>
    lowerDays.includes(d),
  );

  if (hasWeekdays && hasWeekends) return 'everyday';
  if (hasWeekdays && lowerDays.length === 5) return 'weekdays';
  if (hasWeekends && lowerDays.length === 2) return 'weekends';

  // Sort remaining days by standard week order
  const sortedDays = lowerDays
    .filter((d) => DAY_ORDER.includes(d))
    .sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));

  if (sortedDays.length === 0) return lowerDays.join(', '); // Fallback

  const ranges: string[] = [];
  let startDay = sortedDays[0];
  let endDay = sortedDays[0];

  for (let i = 1; i < sortedDays.length; i++) {
    const currentIdx = DAY_ORDER.indexOf(sortedDays[i]);
    const prevIdx = DAY_ORDER.indexOf(endDay);

    if (currentIdx === prevIdx + 1) {
      // Continuous range
      endDay = sortedDays[i];
    } else {
      // Break in range, commit the previous group
      if (startDay === endDay) {
        ranges.push(capitalize(startDay));
      } else if (
        DAY_ORDER.indexOf(endDay) - DAY_ORDER.indexOf(startDay) ===
        1
      ) {
        // Only 2 days, prefer comma over hyphen (e.g., "Monday, Tuesday")
        ranges.push(`${capitalize(startDay)}, ${capitalize(endDay)}`);
      } else {
        ranges.push(`${capitalize(startDay)} - ${capitalize(endDay)}`);
      }

      startDay = sortedDays[i];
      endDay = sortedDays[i];
    }
  }

  // Push the final group
  if (startDay === endDay) {
    ranges.push(capitalize(startDay));
  } else if (DAY_ORDER.indexOf(endDay) - DAY_ORDER.indexOf(startDay) === 1) {
    ranges.push(`${capitalize(startDay)}, ${capitalize(endDay)}`);
  } else {
    ranges.push(`${capitalize(startDay)} - ${capitalize(endDay)}`);
  }

  return ranges.join(', ').toLowerCase();
}

export function toTimeZoneLabel(timezone: string = 'Asia/Ulaanbaatar'): string {
  let formatedTimeZone = '';
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

    formatedTimeZone = tzString.trim(); // Populates formatedTimeZone for GMT matches
  } else {
    const fallbackTz = ` (${timezoneLabel})`;
    formatedTimeZone = fallbackTz.trim();
  }

  return formatedTimeZone;
}

/**
 * Groups and formats an array of online hours into a human-readable string.
 * @param hours - The array of OnlineHour objects from the backend/DB.
 * @param timezone - Optional timezone string to append (e.g., "Asia/Ulaanbaatar")
 */
export function formatOnlineHoursLabel(
  hours: OnlineHour[],
  showTimezone: boolean = true,
  timezone: string = 'Asia/Ulaanbaatar',
): string {
  if (!hours || hours.length === 0) return '';

  // 1. Group days by identical time ranges
  const grouped = hours.reduce((acc, curr) => {
    const key = `${curr.from}|${curr.to}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(curr.day);
    return acc;
  }, {} as Record<string, string[]>);

  // 2. Format each group
  const segments = Object.entries(grouped).map(([timeKey, days]) => {
    const [from, to] = timeKey.split('|');
    const formattedFrom = parseTime(from);
    const formattedTo = parseTime(to);
    const formattedDays = formatDays(days);
    const formattedLabel = toTimeZoneLabel(timezone);

    return `${formattedFrom} and ${formattedTo}${
      showTimezone ? ` ${formattedLabel}` : ''
    }, ${formattedDays}`;
  });

  // 3. Join multiple schedule segments (if a business has split schedules like '9-5 weekdays, 10-2 weekends')
  return segments.join('; and between ');
}
