import { IconMail, IconMessage, IconRepeat } from '@tabler/icons-react';
import { Button, cn, Popover, useFormat } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { paths } from '~/lib/paths';
import { inZone } from '~/lib/timeZones';
import { useSession } from '~/modules/auth/session';
import { type CalendarDay as Day, type CalendarEntry as Entry } from './calendarMonth';

/** Each status's colour on the calendar, the same tones as its badge in the table. */
const STATUS_CHIP = {
  draft: 'bg-accent',
  scheduled: 'bg-info/10 text-(--info-text)',
  sending: 'bg-primary/10 text-primary-text',
  paused: 'bg-warning/10 text-(--warning-text)',
  sent: 'bg-success/10 text-(--success-text)',
  cancelled: 'bg-accent text-muted-foreground',
  failed: 'bg-destructive/10 text-destructive-text',
  recurring: 'bg-info/10 text-(--info-text)',
  // A recurring broadcast's run that isn't made yet: outlined, as it may still change.
  upcoming: 'border border-dashed text-muted-foreground',
} as const satisfies Record<Entry['status'], string>;

/** One entry on its day, in its status's colour; opens its broadcast. */
const CalendarEntry = ({ entry }: { entry: Entry }) => {
  const { t } = useTranslation('broadcasts');
  const fmt = useFormat();
  const { timezone } = useSession().organization;

  const Icon =
    entry.status === 'upcoming' ? IconRepeat : entry.channel === 'email' ? IconMail : IconMessage;

  const status =
    entry.status === 'upcoming'
      ? t('calendar.upcoming', 'Upcoming run')
      : t(`status.${entry.status}`, entry.status);

  const label = `${entry.name} · ${t(`channel.${entry.channel}`, entry.channel)} · ${status}`;

  return (
    <Link
      to={paths.broadcasts.broadcast(entry.id)}
      title={label}
      aria-label={label}
      className={cn(
        'flex w-full min-w-0 items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs font-medium hover:opacity-80',
        STATUS_CHIP[entry.status],
      )}
    >
      <Icon className="size-3 flex-none" />
      <span className="flex-none tabular-nums opacity-70">
        {fmt.time(inZone(entry.at, timezone))}
      </span>
      <span className="min-w-0 truncate">{entry.name}</span>
    </Link>
  );
};

/** The day's broadcasts that didn't fit, in a popover. */
const MoreEntries = ({ day }: { day: Day }) => {
  const { t } = useTranslation('broadcasts');
  const fmt = useFormat();

  return (
    <Popover>
      <Popover.Trigger render={<Button variant="ghost" size="xs" className="w-fit" />}>
        {t('calendar.more', '+{{count}} more', { count: day.hiddenCount })}
      </Popover.Trigger>
      <Popover.Content className="w-64">
        <p className="pb-1 text-xs font-medium text-muted-foreground">
          {fmt.date(day.date, 'EEEE, PP')}
        </p>
        <div className="flex max-h-72 flex-col gap-0.5 overflow-y-auto">
          {day.entries.map((entry) => (
            <CalendarEntry key={entry.key} entry={entry} />
          ))}
        </div>
      </Popover.Content>
    </Popover>
  );
};

/** A cell of the month: its date, then what goes out that day. */
export const CalendarDay = ({ day }: { day: Day }) => (
  <div
    className={cn(
      'flex min-h-0 min-w-0 flex-col gap-0.5 overflow-hidden border-r border-b p-1.5',
      !day.inMonth && 'bg-muted/40',
    )}
  >
    <span
      className={cn(
        'inline-flex size-6 flex-none items-center justify-center rounded-full text-xs tabular-nums',
        day.isToday && 'bg-primary font-semibold text-primary-foreground',
        !day.inMonth && 'text-muted-foreground',
      )}
    >
      {day.date.getDate()}
    </span>
    {day.visible.map((entry) => (
      <CalendarEntry key={entry.key} entry={entry} />
    ))}
    {day.hiddenCount > 0 && <MoreEntries day={day} />}
  </div>
);
