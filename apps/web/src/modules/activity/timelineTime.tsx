import { cn } from 'erxes-ui';
import { createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';

/** The current minute, shared by every entry so relative times move on together. */
export const NowContext = createContext(0);

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

/** Today's relative time; browsers often ship no Mongolian relative times, so they are said here. */
const relativeToday = (minutes: number, language: string) => {
  if (language.startsWith('mn')) {
    if (minutes < 1) return 'дөнгөж сая';

    return minutes < 60 ? `${minutes} мин өмнө` : `${Math.floor(minutes / 60)} цаг өмнө`;
  }

  const relative = new Intl.RelativeTimeFormat(language, { numeric: 'auto', style: 'narrow' });

  if (minutes < 1) return relative.format(0, 'second');

  if (minutes < 60) return relative.format(-minutes, 'minute');

  return relative.format(-Math.floor(minutes / 60), 'hour');
};

/**
 * Short, so a line stays one line: today "now", "5m ago", "4h ago"; an
 * earlier day (its date is the heading) the time, "14:32"; `withDate` adds
 * the date where no heading gives it (pinned notes).
 */
const shortTime = (iso: string, now: number, language: string, withDate: boolean) => {
  const date = new Date(iso);
  const minutes = Math.floor((now - date.getTime()) / 60_000);

  if (sameDay(date, new Date(now)) && minutes >= 0) return relativeToday(minutes, language);

  const time = date.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' });

  if (!withDate) return time;

  return `${date.toLocaleDateString(language, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() === new Date(now).getFullYear() ? undefined : 'numeric',
  })}, ${time}`;
};

/** When an entry happened; the full date and time on hover. */
export const When = ({
  iso,
  withDate = false,
  className,
}: {
  iso: string;
  withDate?: boolean;
  className?: string;
}) => {
  const { i18n } = useTranslation();
  const now = useContext(NowContext);

  return (
    <time
      dateTime={iso}
      title={new Date(iso).toLocaleString(i18n.language, { dateStyle: 'full', timeStyle: 'short' })}
      className={cn(
        'shrink-0 text-xs whitespace-nowrap text-muted-foreground tabular-nums',
        className,
      )}
    >
      {shortTime(iso, now, i18n.language, withDate)}
    </time>
  );
};

/** A day heading: Today, Yesterday, or the date. */
export const dayLabel = (
  iso: string,
  now: number,
  t: (key: string, fallback: string) => string,
  language: string,
) => {
  const date = new Date(iso);
  const today = new Date(now);
  const yesterday = new Date(now);

  yesterday.setDate(today.getDate() - 1);

  if (sameDay(date, today)) return t('today', 'Today');

  if (sameDay(date, yesterday)) return t('yesterday', 'Yesterday');

  return date.toLocaleDateString(language, {
    month: 'long',
    day: 'numeric',
    year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric',
  });
};
