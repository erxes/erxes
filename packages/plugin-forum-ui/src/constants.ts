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

export const PERMISSIONS = [
  { name: 'WRITE_POST', _id: 'WRITE_POST' },
  { name: 'READ_POST', _id: 'READ_POST' },
  { name: 'WRITE_COMMENT', _id: 'WRITE_COMMENT' }
];

export const timeDuractionUnits = ['days', 'weeks', 'months', 'years'];

export const userTypes = [
  { value: '', label: 'All' },
  { value: 'customer', label: 'Customer' },
  { value: 'company', label: 'Company' }
];

export const quizState = [
  { value: 'DRAFT', label: 'DRAFT' },
  { value: 'ARCHIVED', label: 'ARCHIVED' },
  { value: 'PUBLISHED', label: 'PUBLISHED' }
];
