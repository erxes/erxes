export type TEmailLane = 'proven' | 'unknown' | 'suppressed';

export type TEmailSuppressionReason =
  | 'hard_bounce'
  | 'complaint'
  | 'unsubscribe'
  | 'manual';

export interface IEmailAddress {
  _id: string;
  email: string;
  /** Derived by the server from the fields below; never stored. */
  lane: TEmailLane;

  lastSentAt?: string;
  lastDeliveredAt?: string;
  deliveredCount: number;

  softBounceCount: number;
  lastSoftBounceAt?: string;

  suppressedAt?: string;
  suppressionReason?: TEmailSuppressionReason;
}
