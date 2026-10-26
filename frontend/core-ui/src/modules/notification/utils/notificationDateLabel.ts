export const notificationDateLabel = (
  value: string,
  language: string,
  now = new Date(),
): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const calendarDay = (day: Date): number =>
    Date.UTC(day.getFullYear(), day.getMonth(), day.getDate());
  const days = (calendarDay(date) - calendarDay(now)) / 86400000;

  if (days >= -1 && days <= 0) {
    return new Intl.RelativeTimeFormat(language, { numeric: 'auto' }).format(
      days,
      'day',
    );
  }

  return new Intl.DateTimeFormat(language, {
    month: 'short',
    day: 'numeric',
    ...(date.getFullYear() !== now.getFullYear() && { year: 'numeric' }),
  }).format(date);
};
