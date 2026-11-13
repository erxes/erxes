import type { Invoice } from '@erxes/core-contract';

/** The badge for each invoice status. */
export const STATUS_BADGE = {
  pending: 'warning',
  paid: 'success',
  refunded: 'secondary',
  cancelled: 'secondary',
  expired: 'secondary',
  failed: 'destructive',
} as const satisfies Record<Invoice['status'], string>;
