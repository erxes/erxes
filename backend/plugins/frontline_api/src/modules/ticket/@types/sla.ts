/** One priority's promise, in working minutes; an absent clock is not kept. */
export type TTicketSlaRule = {
  priority: number;
  firstResponseMinutes?: number;
  resolutionMinutes?: number;
};

/** A pipeline's SLA policy: a promise per ticket priority. */
export type TTicketSlaPolicy = {
  enabled?: boolean;
  rules?: TTicketSlaRule[];
  /** How long before a due time the warning fires; none when absent. */
  warnBeforeMinutes?: number;
};

export type TTicketSlaClock = 'firstResponse' | 'resolution';
export type TTicketSlaPhase = 'warning' | 'breached';

/**
 * A ticket's SLA state. Due times count the branch's working hours from the
 * ticket's creation; the `…At` marks say when a clock stopped or tripped.
 */
export type TTicketSla = {
  priority?: number;
  firstResponseDueAt?: Date;
  resolutionDueAt?: Date;
  firstRespondedAt?: Date;
  resolvedAt?: Date;
  firstResponseWarnedAt?: Date;
  firstResponseBreachedAt?: Date;
  resolutionWarnedAt?: Date;
  resolutionBreachedAt?: Date;
};
