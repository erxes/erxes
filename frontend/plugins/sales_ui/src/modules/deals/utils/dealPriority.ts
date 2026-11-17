import { PROJECT_PRIORITIES_OPTIONS } from '@/deals/constants/cards';

export const getPriorityLevel = (priority?: string | null): number =>
  Math.max(PROJECT_PRIORITIES_OPTIONS.indexOf(priority || ''), 0);

export const getPriorityName = (level: number): string | undefined =>
  PROJECT_PRIORITIES_OPTIONS[level];
