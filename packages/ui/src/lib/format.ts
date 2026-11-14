import { format, formatDistance, formatDistanceStrict, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { mn } from 'date-fns/locale/mn';
import { useTranslation } from 'react-i18next';

/*
 * Every date, time and number people read goes through here, in the UI's language. Dates
 * format with date-fns patterns (`PP` "Nov 14, 2026", `p` "2:30 PM", `MMM d`, `EEEE`):
 * https://date-fns.org/docs/format. Numbers and amounts go through Intl.NumberFormat.
 */

/** The languages the UI speaks, each with its own name and its date-fns locale. */
export const LANGUAGES = [
  { code: 'en', label: 'English', dates: enUS },
  { code: 'mn', label: 'Монгол', dates: mn },
] as const;

type DateInput = Date | string | number;

/** ISO strings read as written: `2026-11-14` is that day here, not UTC midnight. */
const toDate = (value: DateInput) => (typeof value === 'string' ? parseISO(value) : value);

/** The formatters for `language` (an i18next code), for code outside React. */
export const formatter = (language: string) => {
  const locale =
    LANGUAGES.find((entry) => language.startsWith(entry.code))?.dates ?? LANGUAGES[0].dates;

  return {
    /** A date in a date-fns pattern; `PP` by default ("Nov 14, 2026"). */
    date: (value: DateInput, pattern = 'PP') => format(toDate(value), pattern, { locale }),
    /** A date and time: "Nov 14, 2026, 2:30 PM". */
    dateTime: (value: DateInput) => format(toDate(value), 'PPp', { locale }),
    /** A time of day: "2:30 PM", or "14:30" in a 24-hour language. */
    time: (value: DateInput) => format(toDate(value), 'p', { locale }),
    /** How long ago or ahead: "5 minutes ago", "in 2 days", "less than a minute ago". */
    relative: (value: DateInput, now: DateInput = Date.now()) => {
      const date = toDate(value);
      const base = toDate(now);

      return Math.abs(Number(date) - Number(base)) < 60_000
        ? formatDistance(date, base, { addSuffix: true, locale })
        : formatDistanceStrict(date, base, { addSuffix: true, locale, roundingMethod: 'floor' });
    },
    /** A count or measure: "1,234". */
    number: (value: number) => new Intl.NumberFormat(language).format(value),
    /** A list's total; when counting stopped there (`capped`), there are more: "10,000+". */
    count: (value: number, capped?: boolean) =>
      `${new Intl.NumberFormat(language).format(value)}${capped ? '+' : ''}`,
    /** An amount in the currency's main unit: 1500 MNT → "MNT 1,500.00". */
    currency: (value: number, currency: string) =>
      new Intl.NumberFormat(language, { style: 'currency', currency }).format(value),
  };
};

/** The formatters in the UI's language; a component using them re-renders when it changes. */
export const useFormat = () => formatter(useTranslation().i18n.language);

/** A local day as stored and typed, `yyyy-MM-dd`, the same in every language. */
export const toIsoDay = (date: Date) => format(date, 'yyyy-MM-dd');

/** The browser's time zone ("Asia/Ulaanbaatar"), when it says. */
export const localTimeZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
};

/** A zone's offset today, "UTC+8"; empty for a zone the browser doesn't know. */
export const zoneOffset = (zone: string) => {
  try {
    return (
      new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'shortOffset' })
        .formatToParts(new Date())
        .find((part) => part.type === 'timeZoneName')
        ?.value.replace('GMT', 'UTC') ?? ''
    );
  } catch {
    return '';
  }
};
