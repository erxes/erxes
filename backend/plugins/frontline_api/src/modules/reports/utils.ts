import { CONVERSATION_STATUSES } from '@/inbox/db/definitions/constants';

export const calculatePercentage = (count: number, total: number): number =>
  total > 0 ? Math.round((count / total) * 100) : 0;

export const normalizeStatus = (status?: string) => {
  if (!status) return undefined;
  const upper = status.toUpperCase();
  return Object.values(CONVERSATION_STATUSES).includes(upper as any)
    ? upper
    : undefined;
};
