import { localTimeZone, zoneOffset } from 'erxes-ui';

/** Time zones offered for schedules and dates; the browser's own comes first. */
const COMMON_ZONES = [
  'Asia/Ulaanbaatar',
  'Asia/Hovd',
  'Asia/Shanghai',
  'Asia/Seoul',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Europe/London',
  'Europe/Berlin',
  'America/New_York',
  'America/Los_Angeles',
  'UTC',
];

/** The zones to offer, with `current` (a saved one) always among them. */
export const zoneChoices = (current: string) => [
  ...new Set(
    [localTimeZone(), current, ...COMMON_ZONES].filter((zone): zone is string => Boolean(zone)),
  ),
];

/** "Ulaanbaatar, UTC+8": the city and today's offset. */
export const zoneLabel = (zone: string) => {
  if (zone === 'UTC') return 'UTC';

  const offset = zoneOffset(zone);

  const city = (zone.split('/').pop() ?? zone).replace(/_/g, ' ');

  return offset ? `${city}, ${offset === 'UTC' ? 'UTC+0' : offset}` : city;
};
