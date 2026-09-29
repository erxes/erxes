import { useBroadcastCalendar } from '../../hooks/useBroadcastCalendar';
import { useBroadcastCalendarSelection } from '../../hooks/useBroadcastCalendarSelection';
import { isInRange, weekdayLabels } from '../../utils/calendarMonth';
import { BroadcastErrorState } from '../list/BroadcastStates';
import { BroadcastCalendarCommandBar } from './BroadcastCalendarCommandBar';
import { BroadcastCalendarDay } from './BroadcastCalendarDay';
import { BroadcastCalendarToolbar } from './BroadcastCalendarToolbar';

const WEEKDAYS = weekdayLabels();

export const BroadcastCalendar = () => {
  const {
    label,
    days,
    total,
    isCurrentMonth,
    loading,
    error,
    refetch,
    goPrevious,
    goNext,
    goToday,
  } = useBroadcastCalendar();

  const {
    range,
    startSelection,
    extendSelection,
    clearSelection,
  } = useBroadcastCalendarSelection();

  if (error) {
    return (
      <div className="flex-1 overflow-auto">
        <BroadcastErrorState error={error} onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
      <BroadcastCalendarToolbar
        label={label}
        total={total}
        loading={loading}
        isCurrentMonth={isCurrentMonth}
        goPrevious={goPrevious}
        goNext={goNext}
        goToday={goToday}
      />

      <div className="grid flex-none grid-cols-7 border-y bg-muted/40">
        {WEEKDAYS.map((weekday) => (
          <div
            key={weekday}
            className="px-2 py-1 text-xs font-medium text-muted-foreground"
          >
            {weekday}
          </div>
        ))}
      </div>

      {/* Six rows share the height, but never squeeze below what a cell has to
          show: a short window scrolls instead of clipping. */}
      <div className="grid flex-1 auto-rows-[minmax(7rem,1fr)] grid-cols-7 select-none overflow-auto border-l">
        {days.map((day) => (
          <BroadcastCalendarDay
            key={day.key}
            day={day}
            selected={isInRange(day.date, range)}
            onSelectStart={startSelection}
            onSelectExtend={extendSelection}
          />
        ))}
      </div>

      <BroadcastCalendarCommandBar range={range} onClear={clearSelection} />
    </div>
  );
};
