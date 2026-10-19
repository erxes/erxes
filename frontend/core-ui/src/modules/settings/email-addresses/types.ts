export type TEmailLane = 'proven' | 'unknown' | 'suppressed';

export type TEmailSuppressionReason =
  | 'hard_bounce'
  | 'complaint'
  | 'unsubscribe'
  | 'screened'
  | 'manual';

export type TEmailScreenReason = 'syntax' | 'no_mx' | 'disposable' | 'random';

export interface IEmailAddress {
  _id: string;
  email: string;
  lane: TEmailLane;

  lastSentAt?: string;
  lastDeliveredAt?: string;
  deliveredCount: number;

  softBounceCount: number;
  lastSoftBounceAt?: string;

  suppressedAt?: string;
  suppressionReason?: TEmailSuppressionReason;
  screenReason?: TEmailScreenReason;
}
