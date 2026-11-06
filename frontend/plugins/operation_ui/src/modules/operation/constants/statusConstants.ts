export const STATUS_TYPE_LABELS = [
  'In Progress',
  'Todo',
  'Backlog',
  'Done',
  'Cancelled',
  'Triage',
];

// Mirrors operation_api `STATUS_TYPES`; a task's `status` is a team status id,
// and these are the types that team statuses carry.
export const STATUS_TYPES = {
  STARTED: 1,
  UNSTARTED: 2,
  BACKLOG: 3,
  COMPLETED: 4,
  CANCELLED: 5,
  TRIAGE: 6,
} as const;
