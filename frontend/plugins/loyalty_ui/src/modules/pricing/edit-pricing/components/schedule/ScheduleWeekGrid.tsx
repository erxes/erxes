import { cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { IPricingActiveWindow } from '@/pricing/types';
import {
  SCHEDULE_WEEK,
  WEEKDAY_KEYS,
  daySegments,
  minutesToPercent,
} from '@/pricing/utils/schedule';

const HOUR_MARKS = [0, 6, 12, 18, 24];

// Daily and weekly windows on a week; monthly and yearly ones do not fall on
// fixed weekdays, so they are left to the list.
export const ScheduleWeekGrid = ({
  windows,
}: {
  windows: IPricingActiveWindow[];
}) => {
  const { t } = useTranslation('loyalty');

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{t('schedule-week-view')}</p>
      <div className="overflow-x-auto">
        <div className="grid min-w-[480px] grid-cols-[3rem_1fr] gap-x-2 gap-y-1 text-xs">
          {SCHEDULE_WEEK.map((day) => (
            <div key={day} className="contents">
              <span className="text-muted-foreground">
                {t(`weekday-short-${WEEKDAY_KEYS[day]}`)}
              </span>
              <div className="relative h-4 rounded-sm bg-accent">
                {daySegments(windows, day).map((segment, index) => (
                  <span
                    key={index}
                    className={cn(
                      'absolute inset-y-0 rounded-sm',
                      segment.overnight ? 'bg-info' : 'bg-primary',
                    )}
                    style={{
                      left: minutesToPercent(segment.from),
                      width: minutesToPercent(segment.to - segment.from),
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
          <span />
          <div className="relative h-4 text-muted-foreground">
            {HOUR_MARKS.map((hour) => (
              <span
                key={hour}
                className={cn(
                  'absolute',
                  hour === 0 && 'left-0',
                  hour === 24 && 'right-0',
                  hour !== 0 && hour !== 24 && '-translate-x-1/2',
                )}
                style={
                  hour !== 0 && hour !== 24
                    ? { left: `${(hour / 24) * 100}%` }
                    : undefined
                }
              >
                {String(hour).padStart(2, '0')}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
