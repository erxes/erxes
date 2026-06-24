export const PROJECT_PRIORITIES_OPTIONS = [
  'no-priority',
  'minor',
  'medium',
  'high',
  'critical',
];

export type TPriorityValue = keyof typeof PROJECT_PRIORITIES_OPTIONS;
