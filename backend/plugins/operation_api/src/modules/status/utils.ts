import { DEFAULT_STATUSES } from '@/status/constants/types';

export const generateDefaultStatuses = (teamId: string) => {
  return DEFAULT_STATUSES.map((status) => ({ ...status, teamId }));
};
