/** Compact age of a date, such as 5m, 3h or 2d. */
export const timeAgo = (date: string | number) => {
  const minutes = Math.round((Date.now() - new Date(date).getTime()) / 60000);

  if (minutes < 60) return `${Math.max(minutes, 1)}m`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)}h`;

  return `${Math.round(minutes / 60 / 24)}d`;
};
