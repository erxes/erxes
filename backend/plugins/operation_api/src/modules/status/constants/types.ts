export const STATUS_TYPES = {
  BACKLOG: 3,
  UNSTARTED: 2,
  STARTED: 1,
  COMPLETED: 4,
  CANCELLED: 5,
};

export const DEFAULT_STATUSES = [
  {
    name: 'backlog',
    type: STATUS_TYPES.BACKLOG,
    color: '#6B7280',
    order: 0,
  },
  {
    name: 'todo',
    type: STATUS_TYPES.UNSTARTED,
    color: '#3B82F6',
    order: 0,
  },
  {
    name: 'in progress',
    type: STATUS_TYPES.STARTED,
    color: '#F59E0B',
    order: 0,
  },
  {
    name: 'done',
    type: STATUS_TYPES.COMPLETED,
    color: '#10B981',
    order: 0,
  },
  {
    name: 'cancelled',
    type: STATUS_TYPES.CANCELLED,
    color: '#EF4444',
    order: 0,
  },
];
