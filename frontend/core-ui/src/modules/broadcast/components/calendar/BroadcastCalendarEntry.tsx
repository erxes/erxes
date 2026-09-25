import { cn, Tooltip, useMultiQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { broadcastMethodDisplay } from '../../utils/broadcastMethod';
import {
  calendarEntryDisplay,
  entrySummary,
  entryTime,
  TCalendarEntry,
} from '../../utils/calendarMonth';

export const BroadcastCalendarEntry = ({
  entry,
  className,
}: {
  entry: TCalendarEntry;
  className?: string;
}) => {
  const [, setQueryParams] = useMultiQueryState<{ messageId: string }>([
    'messageId',
  ]);

  const { t } = useTranslation('broadcasts');
  const { dot, chip } = calendarEntryDisplay(entry.state);
  const { Icon, labelKey } = broadcastMethodDisplay(
    entry.method ?? undefined,
  );

  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            onClick={() =>
              setQueryParams({ messageId: entry.engageMessageId })
            }
            // The cell behind this one starts a day selection on press, which
            // opening a campaign is not.
            onPointerDown={(event) => event.stopPropagation()}
            className={cn(
              'flex w-full items-center gap-1.5 rounded px-1 py-0.5 text-left text-xs transition-colors',
              chip,
              className,
            )}
          >
            <span className={cn('size-1.5 flex-none rounded-full', dot)} />
            <span className="flex-none tabular-nums text-muted-foreground">
              {entryTime(entry)}
            </span>
            <span className="min-w-0 flex-1 truncate">
              {entry.title || t('untitled')}
            </span>
          </button>
        </Tooltip.Trigger>
        <Tooltip.Content className="flex items-center gap-1.5">
          <Icon className="size-3.5" />
          {t(labelKey)} · {entrySummary(entry, t)}
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};
