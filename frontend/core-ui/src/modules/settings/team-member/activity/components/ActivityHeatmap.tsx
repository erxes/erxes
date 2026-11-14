import dayjs from 'dayjs';
import { Tooltip } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { formatActiveMinutes } from '../utils/formatActiveMinutes';

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const HOUR_LABELS = [0, 6, 12, 18];

// Monday-first, matching the grid built by groupActivitySlots
const weekdayLabel = (row: number) =>
  dayjs()
    .day((row + 1) % 7)
    .format('dd');

export const ActivityHeatmap = ({ heatmap }: { heatmap: number[][] }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const max = Math.max(1, ...heatmap.flat());

  return (
    <div className="flex flex-col gap-1">
      {heatmap.map((hours, row) => (
        <div key={row} className="flex items-center gap-1">
          <span className="w-6 shrink-0 text-xs text-muted-foreground">
            {weekdayLabel(row)}
          </span>
          <div className="grid flex-1 grid-cols-24 gap-0.5">
            {HOURS.map((hour) => (
              <Tooltip key={hour}>
                <Tooltip.Trigger asChild>
                  <div className="relative aspect-square rounded-xs bg-accent">
                    {hours[hour] > 0 && (
                      <div
                        className="absolute inset-0 rounded-xs bg-primary"
                        style={{ opacity: 0.2 + 0.8 * (hours[hour] / max) }}
                      />
                    )}
                  </div>
                </Tooltip.Trigger>
                <Tooltip.Content>
                  {weekdayLabel(row)} {String(hour).padStart(2, '0')}:00 ·{' '}
                  {formatActiveMinutes(t, hours[hour])}
                </Tooltip.Content>
              </Tooltip>
            ))}
          </div>
        </div>
      ))}
      <div className="flex items-center gap-1">
        <span className="w-6 shrink-0" />
        <div className="grid flex-1 grid-cols-4 text-xs text-muted-foreground">
          {HOUR_LABELS.map((hour) => (
            <span key={hour}>{String(hour).padStart(2, '0')}:00</span>
          ))}
        </div>
      </div>
    </div>
  );
};
