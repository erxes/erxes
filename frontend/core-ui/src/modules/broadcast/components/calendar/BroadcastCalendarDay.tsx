import { cn, Popover, PopoverScoped } from 'erxes-ui';
import { format } from 'date-fns';
import { TCalendarDay } from '../../utils/calendarMonth';
import { BroadcastCalendarEntry } from './BroadcastCalendarEntry';
import { useTranslation } from 'react-i18next';

const DayEntries = ({ day }: { day: TCalendarDay }) => {
  const { t } = useTranslation('broadcasts');

  return (
    <div className="flex min-h-0 flex-col gap-0.5 overflow-hidden">
      {day.visible.map((entry) => (
        <BroadcastCalendarEntry
          key={`${entry.engageMessageId}_${entry.at}`}
          entry={entry}
        />
      ))}

      {day.hiddenCount > 0 && (
        <PopoverScoped>
          <Popover.Trigger asChild>
            <button
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              className="rounded px-1 py-0.5 text-left text-xs font-medium text-muted-foreground hover:bg-accent"
            >
              {t('calendar.more', { count: day.hiddenCount })}
            </button>
          </Popover.Trigger>
          <Popover.Content className="w-64 p-2">
            <p className="px-1 pb-1 text-xs font-medium text-muted-foreground">
              {format(day.date, 'EEEE, d MMMM')}
            </p>
            <div className="flex max-h-72 flex-col gap-0.5 overflow-y-auto">
              {day.entries.map((entry) => (
                <BroadcastCalendarEntry
                  key={`${entry.engageMessageId}_${entry.at}`}
                  entry={entry}
                />
              ))}
            </div>
          </Popover.Content>
        </PopoverScoped>
      )}
    </div>
  );
};

export const BroadcastCalendarDay = ({
  day,
  selected,
  onSelectStart,
  onSelectExtend,
}: {
  day: TCalendarDay;
  selected: boolean;
  onSelectStart: (date: Date) => void;
  onSelectExtend: (date: Date) => void;
}) => (
  <div
    // The pointer, not the mouse: a drag across the grid should work the same
    // on a touchscreen.
    onPointerDown={() => onSelectStart(day.date)}
    onPointerEnter={() => onSelectExtend(day.date)}
    className={cn(
      'flex min-h-0 cursor-pointer flex-col gap-1 border-b border-r p-1.5',
      !day.inMonth && 'bg-muted/40',
      selected && 'bg-primary/5',
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

    <DayEntries day={day} />
  </div>
);
