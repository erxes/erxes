import {
  addWorkingTime,
  TWorkingCalendar,
} from 'erxes-api-shared/core-modules';
import {
  TTicketSla,
  TTicketSlaClock,
  TTicketSlaPhase,
  TTicketSlaPolicy,
} from '@/ticket/@types/sla';
import { isClosingStatus } from '@/ticket/utils/cpNotifications';

const MINUTE = 60_000;

export const SLA_PRIORITIES = [0, 1, 2, 3, 4];

/** The flag a clock's phase sets on the ticket, e.g. `firstResponseBreachedAt`. */
export const slaFlagOf = (clock: TTicketSlaClock, phase: TTicketSlaPhase) =>
  `${clock}${phase === 'warning' ? 'Warned' : 'Breached'}At` as const;

const dueOf = (sla: TTicketSla, clock: TTicketSlaClock) =>
  clock === 'firstResponse' ? sla.firstResponseDueAt : sla.resolutionDueAt;

const stoppedOf = (sla: TTicketSla, clock: TTicketSlaClock) =>
  clock === 'firstResponse' ? sla.firstRespondedAt : sla.resolvedAt;

const sameTime = (a?: Date | null, b?: Date | null) =>
  (a ? new Date(a).getTime() : 0) === (b ? new Date(b).getTime() : 0);

const toMinutes = (value: unknown) => {
  const minutes = Number(value);

  return Number.isFinite(minutes) && minutes > 0 ? Math.round(minutes) : undefined;
};

/** A policy as stored, or refused with the reason an editor can act on. */
export const normalizeSlaPolicy = (
  policy?: TTicketSlaPolicy | null,
): TTicketSlaPolicy | null => {
  if (!policy) {
    return null;
  }

  const rules = (policy.rules || []).map((rule) => {
    if (!SLA_PRIORITIES.includes(Number(rule.priority))) {
      throw new Error(`SLA priority ${rule.priority} does not exist`);
    }

    return {
      priority: Number(rule.priority),
      firstResponseMinutes: toMinutes(rule.firstResponseMinutes),
      resolutionMinutes: toMinutes(rule.resolutionMinutes),
    };
  });

  if (new Set(rules.map((rule) => rule.priority)).size !== rules.length) {
    throw new Error('Each priority can have one SLA rule');
  }

  return {
    enabled: !!policy.enabled,
    rules: rules.filter(
      (rule) => rule.firstResponseMinutes || rule.resolutionMinutes,
    ),
    warnBeforeMinutes: toMinutes(policy.warnBeforeMinutes),
  };
};

/**
 * A ticket's SLA after a change: due times from its creation and priority,
 * counted in working time; the response mark kept; resolution marked while the
 * ticket is in a closing status and cleared when it reopens. A due time that
 * moves clears its warning and breach, so the new one can trip again. Null
 * when the policy keeps no promise for this ticket.
 */
export const computeTicketSla = ({
  policy,
  priority,
  createdAt,
  statusType,
  calendar,
  current,
  now = new Date(),
}: {
  policy?: TTicketSlaPolicy | null;
  priority?: number;
  createdAt: Date;
  statusType?: number;
  calendar?: TWorkingCalendar;
  current?: TTicketSla | null;
  now?: Date;
}): TTicketSla | null => {
  const rule = policy?.enabled
    ? (policy.rules || []).find((item) => item.priority === (priority || 0))
    : undefined;

  if (!rule) {
    return null;
  }

  const firstResponseDueAt = rule.firstResponseMinutes
    ? addWorkingTime(calendar, createdAt, rule.firstResponseMinutes)
    : undefined;
  const resolutionDueAt = rule.resolutionMinutes
    ? addWorkingTime(calendar, createdAt, rule.resolutionMinutes)
    : undefined;
  const previous = current || {};

  const keepFlags = (clock: TTicketSlaClock, due?: Date) =>
    sameTime(dueOf(previous, clock), due)
      ? {
          [slaFlagOf(clock, 'warning')]: previous[slaFlagOf(clock, 'warning')],
          [slaFlagOf(clock, 'breached')]: previous[slaFlagOf(clock, 'breached')],
        }
      : {};

  const sla: TTicketSla = {
    priority: priority || 0,
    firstResponseDueAt,
    resolutionDueAt,
    firstRespondedAt: previous.firstRespondedAt,
    resolvedAt: isClosingStatus(statusType) ? previous.resolvedAt || now : undefined,
    ...keepFlags('firstResponse', firstResponseDueAt),
    ...keepFlags('resolution', resolutionDueAt),
  };

  return Object.fromEntries(
    Object.entries(sla).filter(([, value]) => value !== undefined),
  ) as TTicketSla;
};

export const isSlaEqual = (a?: TTicketSla | null, b?: TTicketSla | null) => {
  const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);

  // Dates come back from Mongo as Date and from JSON as strings: compare times.
  const valueOf = (value: unknown) =>
    value instanceof Date || typeof value === 'string'
      ? new Date(value).getTime()
      : value;

  return [...keys].every(
    (key) =>
      valueOf((a || {})[key as keyof TTicketSla]) ===
      valueOf((b || {})[key as keyof TTicketSla]),
  );
};

export type TSlaCheck = {
  clock: TTicketSlaClock;
  phase: TTicketSlaPhase;
  at: Date;
  dueAt: Date;
};

/** The warning and breach checks a ticket's running clocks still need. */
export const pendingSlaChecks = (
  sla: TTicketSla | null | undefined,
  warnBeforeMinutes?: number,
): TSlaCheck[] => {
  if (!sla) {
    return [];
  }

  return (['firstResponse', 'resolution'] as TTicketSlaClock[]).flatMap(
    (clock) => {
      const due = dueOf(sla, clock);

      if (!due || stoppedOf(sla, clock)) {
        return [];
      }

      const dueAt = new Date(due);
      const checks: TSlaCheck[] = [];

      if (warnBeforeMinutes && !sla[slaFlagOf(clock, 'warning')]) {
        checks.push({
          clock,
          phase: 'warning',
          at: new Date(dueAt.getTime() - warnBeforeMinutes * MINUTE),
          dueAt,
        });
      }

      if (!sla[slaFlagOf(clock, 'breached')]) {
        checks.push({ clock, phase: 'breached', at: dueAt, dueAt });
      }

      return checks;
    },
  );
};

/**
 * Whether a scheduled check still applies: the clock runs, its due time is the
 * one it was armed for, and the phase has not tripped yet.
 */
export const isSlaCheckDue = (
  sla: TTicketSla | null | undefined,
  { clock, phase, dueAt }: Pick<TSlaCheck, 'clock' | 'phase' | 'dueAt'>,
) =>
  !!sla &&
  sameTime(dueOf(sla, clock), dueAt) &&
  !stoppedOf(sla, clock) &&
  !sla[slaFlagOf(clock, phase)];
