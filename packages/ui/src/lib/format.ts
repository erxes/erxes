import { format, formatDistance, formatDistanceStrict, parseISO } from 'date-fns';
import { enUS } from 'react-day-picker/locale/en-US';
import { mn } from 'react-day-picker/locale/mn';
import { useTranslation } from 'react-i18next';
import { fixNum } from './numbers';

/*
 * Every date, time and number people read goes through here, in the UI's language. Dates
 * format with date-fns patterns (`PP` "Nov 14, 2026", `p` "2:30 PM", `MMM d`, `EEEE`):
 * https://date-fns.org/docs/format. Numbers and amounts go through Intl.NumberFormat.
 */

/**
 * react-day-picker's English, with each day button named "Monday, November 30, 2026". Its own
 * "November 30th" lacks the "30" the button shows, which is what voice control users say.
 */
const en: typeof enUS = {
  ...enUS,
  labels: {
    ...enUS.labels,
    labelDayButton: (date, modifiers) => {
      const label = format(date, 'EEEE, MMMM d, y', { locale: enUS });
      const named = modifiers.today ? `Today, ${label}` : label;

      return modifiers.selected ? `${named}, selected` : named;
    },
  },
};

/**
 * The UI's languages, each with its own name and date-fns locale. The locales are
 * react-day-picker's, date-fns's own plus the calendar's labels ("Go to the Next Month").
 */
export const LANGUAGES = [
  { code: 'en', label: 'English', dates: en },
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
    /** The language's date-fns locale with the calendar's labels, for `Calendar`. */
    locale,
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

/** How many decimals a currency has (USD and MNT 2, JPY 0, KWD 3). */
export const currencyDigits = (currency: string) =>
  new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions()
    .maximumFractionDigits ?? 2;

/**
 * Date, number and money formatters in the UI's language, for components.
 * A component using them re-renders when the language changes.
 */
export const useFormat = () => formatter(useTranslation().i18n.language);

/** A local day as stored and typed, `yyyy-MM-dd`, in every language. */
export const toIsoDay = (date: Date) => format(date, 'yyyy-MM-dd');

/** The browser's time zone ("Asia/Ulaanbaatar"), when it says. */
export const localTimeZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
};

/**
 * A time zone's offset today, like "UTC+8".
 * It is empty for a zone the browser doesn't know.
 */
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

/**
 * A number with separators and exactly `p` decimals (2 by default).
 * It rounds with `fixNum` first: 1234.5 → "1,234.50", in every language, as 3.x showed it.
 */
export const displayNum = (value: number | string | null | undefined, p = 2) =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: p, maximumFractionDigits: p }).format(
    fixNum(value, p),
  );

/** One decimal, without a trailing ".0". */
const shortAmount = (value: number) => value.toFixed(1).replace(/\.?0+$/, '');

/**
 * An amount to read: 2 decimals, or with `short` "1.2k", "3m", "4b".
 * The long form uses the browser's separators ("1,234.5"), as 3.x did.
 */
export const formatAmount = (amount: number, kind?: 'short' | 'finance') => {
  if (kind !== 'short') return Number(amount.toFixed(2)).toLocaleString();

  if (amount < 1000) return shortAmount(amount);

  if (amount < 1_000_000) return `${shortAmount(amount / 1000)}k`;

  if (amount < 1_000_000_000) return `${shortAmount(amount / 1_000_000)}m`;

  return `${shortAmount(amount / 1_000_000_000)}b`;
};
