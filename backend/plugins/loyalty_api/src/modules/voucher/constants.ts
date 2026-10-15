export const VOUCHER_STATUS = {
  NEW: 'new',
  // Picked on one order or deal, not paid yet (`usedIn` names it).
  ONHOLD: 'onhold',
  LOSS: 'used',
  CANCELLED: 'cancelled',
  // Never written any more: expiry is computed. Kept for older records.
  EXPIRED: 'expired',
  ALL: ['new', 'onhold', 'used', 'cancelled', 'expired'],
};
