import {
  differenceInDays,
  formatDistance,
  formatDistanceStrict,
  isToday,
  startOfDay,
} from 'date-fns';

export const formatDateISOStringToRelativeDate = (
  isoDate: string,
  isDayMaximumPrecision = false,
) => {
  const now = new Date();
  const targetDate = new Date(isoDate);

  if (isDayMaximumPrecision && isToday(targetDate)) return 'Today';

  const isWithin24h = Math.abs(differenceInDays(targetDate, now)) < 1;

  if (isDayMaximumPrecision || !isWithin24h)
    return formatDistance(startOfDay(targetDate), startOfDay(now), {
      addSuffix: true,
    });

  return formatDistance(targetDate, now, { addSuffix: true });
};

export const formatDateISOStringToRelativeDateShort = (isoDate: string) => {
  const now = new Date();
  const targetDate = new Date(isoDate);

  return formatDistanceStrict(targetDate, now, { addSuffix: false })
    .replace(/\s*years?/g, 'y')
    .replace(/\s*months?/g, 'mo')
    .replace(/\s*days?/g, 'd')
    .replace(/\s*hours?/g, 'h')
    .replace(/\s*minutes?/g, 'm')
    .replace(/\s*seconds?/g, 's');
};
