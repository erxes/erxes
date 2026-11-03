import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { IActivityDay } from '../types';
import { formatActiveMinutes } from '../utils/formatActiveMinutes';

const RECENT_DAYS = 7;

export const ActivityRecentDays = ({ days }: { days: IActivityDay[] }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const recent = days
    .filter((day) => day.minutes > 0)
    .slice(-RECENT_DAYS)
    .reverse();

  return (
    <ul className="flex flex-col divide-y rounded-lg border">
      {recent.map((day) => (
        <li
          key={day.date}
          className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
        >
          <span className="font-medium">
            {dayjs(day.date).format('ddd, MMM D')}
          </span>
          <span className="text-muted-foreground">
            {day.firstAt && day.lastAt
              ? `${dayjs(day.firstAt).format('HH:mm')}–${dayjs(
                  day.lastAt,
                ).format('HH:mm')}`
              : ''}
          </span>
          <span className="tabular-nums">
            {formatActiveMinutes(t, day.minutes)}
          </span>
        </li>
      ))}
    </ul>
  );
};
