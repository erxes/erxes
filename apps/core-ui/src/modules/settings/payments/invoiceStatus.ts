import type { Invoice } from '@erxes/core-contract';

/** Minor units (cents, möngö) as people read them. */
export const money = (amount: number, currency = 'MNT') =>
  `${(amount / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currency === 'MNT' ? '₮' : currency}`;

/** The badge for each invoice status. */
export const STATUS_BADGE = {
  pending: 'warning',
  paid: 'success',
  refunded: 'secondary',
  cancelled: 'secondary',
  expired: 'secondary',
  failed: 'destructive',
} as const satisfies Record<Invoice['status'], string>;
