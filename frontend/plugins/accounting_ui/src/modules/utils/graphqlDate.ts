import { format, isValid } from 'date-fns';

export const formatDate = (
  value: string | number | Date | null | undefined,
  pattern: string,
  options?: Parameters<typeof format>[2],
) => {
  if (value == null) return '-';
  const date = new Date(value);
  return isValid(date) ? format(date, pattern, options) : '-';
};
