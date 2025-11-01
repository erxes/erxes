export const TICKET_STATUS_TYPES = {
  NEW: 1,
  OPEN: 2,
  IN_PROGRESS: 3,
  RESOLVED: 4,
  CLOSED: 5,
  CANCELLED: 6,
};
export const TICKET_STATUS_TYPE_NAMES = {
  [TICKET_STATUS_TYPES.NEW]: 'New',
  [TICKET_STATUS_TYPES.OPEN]: 'Open',
  [TICKET_STATUS_TYPES.IN_PROGRESS]: 'In progress',
  [TICKET_STATUS_TYPES.RESOLVED]: 'Resolved',
  [TICKET_STATUS_TYPES.CLOSED]: 'Closed',
  [TICKET_STATUS_TYPES.CANCELLED]: 'Cancelled',
};

export const TICKET_DEFAULT_STATUSES = [
  {
    name: 'new',
    type: TICKET_STATUS_TYPES.NEW,
    color: '#3B82F6',
    order: 0,
  },
  {
    name: 'open',
    type: TICKET_STATUS_TYPES.OPEN,
    color: '#F59E0B',
    order: 1,
  },
  {
    name: 'in progress',
    type: TICKET_STATUS_TYPES.IN_PROGRESS,
    color: '#FBBF24',
    order: 2,
  },
  {
    name: 'resolved',
    type: TICKET_STATUS_TYPES.RESOLVED,
    color: '#10B981',
    order: 3,
  },
  {
    name: 'closed',
    type: TICKET_STATUS_TYPES.CLOSED,
    color: '#6B7280',
    order: 4,
  },
  {
    name: 'cancelled',
    type: TICKET_STATUS_TYPES.CANCELLED,
    color: '#EF4444',
    order: 5,
  },
];
