import { messageOf } from '@erxes/core-contract/client';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { Button, Spinner, useFormat } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { CalendarDay } from './CalendarDay';
import { useBroadcastsCalendar } from './useBroadcastsCalendar';

type Calendar = ReturnType<typeof useBroadcastsCalendar>;

/** Previous and next month, the month's name and count, and back to today. */
const CalendarToolbar = ({ calendar }: { calendar: Calendar }) => {
  const { t } = useTranslation('broadcasts');
  const fmt = useFormat();

  return (
    <div className="flex flex-none items-center gap-2 px-3 py-2">
      <Button
        variant="ghost"
        size="icon"
        aria-label={t('calendar.previous', 'Previous month')}
        onClick={calendar.goPrevious}
      >
        <IconChevronLeft />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={t('calendar.next', 'Next month')}
        onClick={calendar.goNext}
      >
        <IconChevronRight />
      </Button>
      <h2 className="text-base font-medium capitalize">{calendar.label}</h2>
      {calendar.query.isFetching && <Spinner size="sm" />}
      <span className="text-xs text-muted-foreground">
        {calendar.total > 0
          ? t('calendar.count', '{{formatted}} broadcasts', {
              count: calendar.total,
              formatted: fmt.number(calendar.total),
            })
          : t('calendar.nothing', 'Nothing goes out this month')}
      </span>
      {!calendar.isCurrentMonth && (
        <Button variant="outline" size="sm" className="ml-auto" onClick={calendar.goToday}>
          {t('calendar.today', 'Today')}
        </Button>
      )}
    </div>
  );
};

/** The broadcasts on a month grid, each on the day it went or goes out; drafts with no date aren't on it. */
export const BroadcastsCalendar = () => {
  const calendar = useBroadcastsCalendar();

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <CalendarToolbar calendar={calendar} />
      {calendar.query.error ? (
        <p className="m-3 text-sm text-destructive-text">{messageOf(calendar.query.error)}</p>
      ) : (
        <>
          <div className="grid flex-none grid-cols-7 border-y bg-muted/40">
            {calendar.weekdays.map((weekday) => (
              <div key={weekday} className="px-2 py-1 text-xs font-medium text-muted-foreground">
                {weekday}
              </div>
            ))}
          </div>
          {/* Six rows share the height, but none below 7rem: a short window scrolls. */}
          <div className="flex min-h-0 flex-1 flex-col overflow-auto">
            <div className="grid min-h-168 flex-1 grid-cols-7 grid-rows-6 border-l">
              {calendar.days.map((day) => (
                <CalendarDay key={day.key} day={day} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
