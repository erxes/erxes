import { intlTag, type Locale } from './locales';
import type { Translate } from './translate';

const EMPTY = '—';

const parse = (value: string | null): Date | null => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDate = (value: string | null, locale: Locale): string =>
  parse(value)?.toLocaleDateString(intlTag(locale), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }) ?? EMPTY;

export const formatDateTime = (value: string | null, locale: Locale): string =>
  parse(value)?.toLocaleString(intlTag(locale), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) ?? EMPTY;

export const dateParts = (
  value: string | null,
  locale: Locale,
): { day: string; month: string } | null => {
  const date = parse(value);

  return date
    ? {
        day: date.toLocaleDateString(intlTag(locale), { day: 'numeric' }),
        month: date.toLocaleDateString(intlTag(locale), { month: 'short' }),
      }
    : null;
};

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31536000000],
  ['month', 2592000000],
  ['week', 604800000],
  ['day', 86400000],
  ['hour', 3600000],
  ['minute', 60000],
];

export const formatRelativeTime = (
  value: string | null,
  locale: Locale,
  t: Translate,
): string => {
  const date = parse(value);

  if (!date) {
    return EMPTY;
  }

  const diff = date.getTime() - Date.now();
  const distance = Math.abs(diff);
  const relative = new Intl.RelativeTimeFormat(intlTag(locale), {
    numeric: 'auto',
  });

  for (const [unit, step] of RELATIVE_UNITS) {
    if (distance >= step) {
      return relative.format(Math.round(diff / step), unit);
    }
  }

  return t('time.justNow');
};

export const formatNumber = (value: number, locale: Locale): string =>
  value.toLocaleString(intlTag(locale));
