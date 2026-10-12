import { DAY_MS } from '../constants/time';

export const daysUntil = (value?: string | null) =>
  value ? Math.ceil((new Date(value).getTime() - Date.now()) / DAY_MS) : 0;
