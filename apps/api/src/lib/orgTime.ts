import { TZDate } from '@date-fns/tz';
import { type Db, organizations } from '@erxes/core-db';
import { type AnyColumn, sql } from 'drizzle-orm';

/** The ISO weekday of a JavaScript day (0 = Sunday): 1 = Monday … 7 = Sunday. */
const isoWeekday = (day: number) => ((day + 6) % 7) + 1;

/** A calendar date: month 1-12, weekday 1 = Monday … 7 = Sunday. */
export interface CalendarDate {
  year: number;
  month: number;
  day: number;
  weekday: number;
}

/** The scope's organisation's time zone (`withOrg`): every schedule's wall clock and day. */
export const orgTimezone = async (client: Db) => {
  const [row] = await client
    .select({ timezone: organizations.timezone })
    .from(organizations)
    .limit(1);

  if (!row) throw new Error('no organisation in scope');

  return row.timezone;
};

/** The calendar date an instant falls on in a time zone. */
export const zonedDate = (instant: Date, timeZone: string): CalendarDate => {
  const local = new TZDate(instant, timeZone);

  return {
    year: local.getFullYear(),
    month: local.getMonth() + 1,
    day: local.getDate(),
    weekday: isoWeekday(local.getDay()),
  };
};

/** The date `days` after a date (negative: before), across months and years. */
export const addDays = (date: CalendarDate, days: number): CalendarDate => {
  const moved = new Date(Date.UTC(date.year, date.month - 1, date.day + days));

  return {
    year: moved.getUTCFullYear(),
    month: moved.getUTCMonth() + 1,
    day: moved.getUTCDate(),
    weekday: isoWeekday(moved.getUTCDay()),
  };
};

/** `YYYY-MM-DD`, as a date column holds it. */
export const isoDay = (date: CalendarDate) =>
  `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;

/** The day (`YYYY-MM-DD`) an instant falls on in a time zone. */
export const localDay = (timeZone: string, at = new Date()) => isoDay(zonedDate(at, timeZone));

/** The instant a wall-clock time on a date is in a time zone. */
export const zonedInstant = (timeZone: string, date: CalendarDate, hour = 0, minute = 0) =>
  new Date(new TZDate(date.year, date.month - 1, date.day, hour, minute, timeZone).getTime());

/** When the next day starts in a time zone: its next midnight. */
export const nextMidnight = (timeZone: string, after = new Date()) =>
  zonedInstant(timeZone, addDays(zonedDate(after, timeZone), 1));

/** SQL: the zone of the organisation in a row's `org_id` column, so each row reads its own. */
export const orgTimezoneSql = (orgId: AnyColumn) =>
  sql<string>`(select o.timezone from core_organizations o where o.id = ${orgId})`;

/** SQL: the day it is now for the organisation in a row's `org_id` column. */
export const orgTodaySql = (orgId: AnyColumn) =>
  sql<string>`(now() at time zone ${orgTimezoneSql(orgId)})::date`;
