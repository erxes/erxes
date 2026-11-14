import { cn, formatter } from 'erxes-ui';
import { createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';

/** The current minute, shared by every entry so relative times move on together. */
export const NowContext = createContext(0);

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

/**
 * Today how long ago ("5 minutes ago"); an earlier day (its date is the heading) the
 * time, "14:32"; `withDate` adds the date where no heading gives it (pinned notes).
 */
const shortTime = (iso: string, now: number, language: string, withDate: boolean) => {
  const date = new Date(iso);
  const fmt = formatter(language);

  if (sameDay(date, new Date(now)) && date.getTime() <= now) return fmt.relative(date, now);

  const time = fmt.time(date);

  if (!withDate) return time;

  const sameYear = date.getFullYear() === new Date(now).getFullYear();

  return `${fmt.date(date, sameYear ? 'MMM d' : 'PP')}, ${time}`;
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
      title={formatter(i18n.language).date(iso, 'PPPPp')}
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

  return formatter(language).date(
    date,
    date.getFullYear() === today.getFullYear() ? 'MMMM d' : 'PPP',
  );
};
