export const stateFilters = [
  { key: 'DRAFT', value: 'Draft' },
  { key: 'PUBLISHED', value: 'Published' }
];

export const categoryApprovalStates = [
  { key: 'PENDING', value: 'Pending' },
  { key: 'APPROVED', value: 'Approved' },
  { key: 'DENIED', value: 'Denied' }
];

export const READ_CP_USER_LEVELS = {
  GUEST: 0,
  REGISTERED: 1,
  SUBSCRIBED: 2,
  NO_ONE: 999
} as const;

export const WRITE_CP_USER_LEVELS = {
  REGISTERED: 1,
  SUBSCRIBED: 2,
  NO_ONE: 999
} as const;
