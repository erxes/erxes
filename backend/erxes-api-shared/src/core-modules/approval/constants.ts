export const APPROVAL_LOCK_STATUSES = {
  ACTIVE: 'active',
  RELEASED: 'released',
} as const;

export const APPROVAL_APPROVER_SCOPES = {
  LOCKER_ONLY: 'lockerOnly',
  LOCKER_AND_ALLOWED_USERS: 'lockerAndAllowedUsers',
} as const;

export const APPROVAL_MODES = {
  FIRST_WINS: 'firstWins',
  UNANIMOUS: 'unanimous',
} as const;

export const APPROVAL_REQUEST_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
} as const;

export const APPROVAL_DECISIONS = {
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export const APPROVAL_NOTIFICATION_CONTENT_TYPE = 'core:approval';

export const APPROVAL_NOTIFICATION_ACTIONS = {
  REQUESTED: 'approval.requested',
} as const;
