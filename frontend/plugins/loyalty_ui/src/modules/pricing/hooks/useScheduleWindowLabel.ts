import { useTranslation } from 'react-i18next';
import { IPricingActiveWindow } from '@/pricing/types';
import {
  SCHEDULE_WEEK,
  WEEKDAY_KEYS,
  formatMonthDay,
  isAllDay,
} from '@/pricing/utils/schedule';

// Words for a window, as its list row and the schedule check show it.
export const useScheduleWindowLabel = () => {
  const { t } = useTranslation('loyalty');

  const days = (window: IPricingActiveWindow) => {
    switch (window.type) {
      case 'weekly':
        return SCHEDULE_WEEK.filter((day) => window.weekDays?.includes(day))
          .map((day) => t(`weekday-short-${WEEKDAY_KEYS[day]}`))
          .join(' ');
      case 'monthly':
        return t('schedule-month-days-short', {
          days: (window.monthDays || []).join(', '),
        });
      case 'yearly':
        return `${formatMonthDay(window.fromMonthDay)} – ${formatMonthDay(
          window.toMonthDay,
        )}`;
      default:
        return '';
    }
  };

  const time = (window: IPricingActiveWindow) =>
    isAllDay(window)
      ? t('schedule-all-day')
      : `${window.startTime} – ${window.endTime}`;

  const type = (window: IPricingActiveWindow) =>
    t(`schedule-type-${window.type}`);

  const full = (window: IPricingActiveWindow) =>
    [type(window), days(window), time(window)].filter(Boolean).join(' · ');

  return { days, time, type, full };
};
