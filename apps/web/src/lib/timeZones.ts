import { TZDate } from '@date-fns/tz';
import { timeZones } from '@erxes/core-contract';
import { format } from 'date-fns';
import { zoneOffset } from 'erxes-ui';
import type { RegionOption } from './region';

/** "UTC+8" for a zone, "UTC+0" for one on UTC. */
const offsetOf = (zone: string) => {
  const offset = zoneOffset(zone);

  return offset === 'UTC' ? 'UTC+0' : offset;
};

/** "Ulaanbaatar, UTC+8": the city and today's offset. */
export const zoneLabel = (zone: string) => {
  if (zone === 'UTC') return 'UTC';

  const offset = offsetOf(zone);

  const city = (zone.split('/').pop() ?? zone).replace(/_/g, ' ');

  return offset ? `${city}, ${offset}` : city;
};

/** Every zone the browser knows, as "Asia/Ulaanbaatar (UTC+8)", `current` among them. */
export const timeZoneOptions = (current: string): RegionOption[] =>
  [...new Set([...timeZones(), current])].map((zone) => ({
    value: zone,
    label: zone === 'UTC' ? 'UTC' : `${zone.replace(/_/g, ' ')} (${offsetOf(zone)})`,
  }));

/** A `datetime-local` value: an instant on a zone's wall clock, to the minute. */
export const zonedInputValue = (instant: Date, zone: string) =>
  format(new TZDate(instant, zone), "yyyy-MM-dd'T'HH:mm");

/** An instant on a zone's wall clock: date-fns (and `useFormat`) read it there. */
export const inZone = (instant: Date | string, zone: string) => new TZDate(new Date(instant), zone);

/** The day (`yyyy-MM-dd`) an instant falls on in a zone. */
export const zonedDay = (instant: Date | string, zone: string) =>
  format(inZone(instant, zone), 'yyyy-MM-dd');

/** The instant a `datetime-local` value is on a zone's wall clock (invalid if it isn't one). */
export const fromZonedInput = (value: string, zone: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);

  if (!match) return new Date(Number.NaN);

  const [year, month, day, hour, minute] = match.slice(1).map(Number);

  return new Date(new TZDate(year ?? 0, (month ?? 1) - 1, day ?? 1, hour ?? 0, minute ?? 0, zone));
};

/** The instant a day (`yyyy-MM-dd`) starts in a zone. */
export const zonedDayStart = (day: string, zone: string) => fromZonedInput(`${day}T00:00`, zone);
