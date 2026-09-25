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
  // Approved, but the change it carried could not be applied. Kept apart from
  // `approved` so a decision nobody acted on is never read as a done one.
  APPLY_FAILED: 'applyFailed',
} as const;

/**
 * What a request asks for. `access` lets the requester past a lock and the
 * system does nothing else; `change` carries the work itself, and approving it
 * is what performs it.
 */
export const APPROVAL_REQUEST_KINDS = {
  ACCESS: 'access',
  CHANGE: 'change',
} as const;

export const APPROVAL_DECISIONS = {
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export const APPROVAL_NOTIFICATION_CONTENT_TYPE = 'core:approval';

export const APPROVAL_NOTIFICATION_ACTIONS = {
  REQUESTED: 'approval.requested',
} as const;
