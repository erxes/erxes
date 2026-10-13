export const TICKET_STATUS_TYPES = {
  NEW: 1,
  OPEN: 2,
  IN_PROGRESS: 3,
  RESOLVED: 4,
  CLOSED: 5,
  CANCELLED: 6,
} as const;

const FINISHED_TYPES: number[] = [
  TICKET_STATUS_TYPES.RESOLVED,
  TICKET_STATUS_TYPES.CLOSED,
  TICKET_STATUS_TYPES.CANCELLED,
];

export const isFinishedStatus = (type: number | null): boolean =>
  type !== null && FINISHED_TYPES.includes(type);
