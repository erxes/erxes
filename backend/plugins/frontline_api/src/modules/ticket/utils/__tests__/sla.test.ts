import {
  computeTicketSla,
  isSlaCheckDue,
  normalizeSlaPolicy,
  pendingSlaChecks,
} from '@/ticket/utils/sla';
import { matchTicketSlaEvent } from '@/ticket/meta/automations/trigger/checkSlaTrigger';
import { TTicketSlaPolicy } from '@/ticket/@types/sla';

const weekday = { inactive: false, startFrom: '09:00', endTo: '18:00' };
const calendar = {
  timeZone: 'Asia/Ulaanbaatar',
  workhours: {
    Monday: weekday,
    Tuesday: weekday,
    Wednesday: weekday,
    Thursday: weekday,
    Friday: weekday,
  },
};
const ub = (local: string) => new Date(`${local}+08:00`);

const policy: TTicketSlaPolicy = {
  enabled: true,
  warnBeforeMinutes: 30,
  rules: [
    { priority: 4, firstResponseMinutes: 60, resolutionMinutes: 240 },
    { priority: 2, firstResponseMinutes: 480 },
  ],
};

describe('computeTicketSla', () => {
  it('counts the promise in working hours from creation', () => {
    // Critical, Friday 17:00: the hour to 18:00 is still open; 4 hours run
    // into Monday 12:00.
    expect(
      computeTicketSla({
        policy,
        priority: 4,
        createdAt: ub('2026-11-13T17:00:00'),
        statusType: 2,
        calendar,
      }),
    ).toEqual({
      priority: 4,
      firstResponseDueAt: ub('2026-11-13T18:00:00'),
      resolutionDueAt: ub('2026-11-16T12:00:00'),
    });
  });

  it('keeps no promise for a priority without a rule, or a disabled policy', () => {
    const base = { createdAt: ub('2026-11-09T10:00:00'), statusType: 2 };

    expect(computeTicketSla({ ...base, policy, priority: 1 })).toBeNull();
    expect(
      computeTicketSla({ ...base, policy: { ...policy, enabled: false }, priority: 4 }),
    ).toBeNull();
  });

  it('marks resolution on a closing status and clears it on reopening', () => {
    const now = ub('2026-11-09T11:00:00');
    const resolved = computeTicketSla({
      policy,
      priority: 4,
      createdAt: ub('2026-11-09T10:00:00'),
      statusType: 4,
      now,
    });

    expect(resolved?.resolvedAt).toEqual(now);
    expect(
      computeTicketSla({
        policy,
        priority: 4,
        createdAt: ub('2026-11-09T10:00:00'),
        statusType: 2,
        current: resolved,
      })?.resolvedAt,
    ).toBeUndefined();
  });

  it('clears a breach when the due time moves, keeps it when it does not', () => {
    const createdAt = ub('2026-11-09T10:00:00');
    const breached = {
      ...computeTicketSla({ policy, priority: 4, createdAt, statusType: 2, calendar }),
      firstResponseBreachedAt: ub('2026-11-09T11:00:00'),
    };

    expect(
      computeTicketSla({
        policy,
        priority: 4,
        createdAt,
        statusType: 2,
        calendar,
        current: breached,
      })?.firstResponseBreachedAt,
    ).toEqual(ub('2026-11-09T11:00:00'));
    expect(
      computeTicketSla({
        policy,
        priority: 2,
        createdAt,
        statusType: 2,
        calendar,
        current: breached,
      })?.firstResponseBreachedAt,
    ).toBeUndefined();
  });
});

describe('SLA checks', () => {
  const sla = {
    priority: 4,
    firstResponseDueAt: ub('2026-11-09T11:00:00'),
    resolutionDueAt: ub('2026-11-09T14:00:00'),
  };

  it('arms a warning and a breach per running clock', () => {
    expect(pendingSlaChecks(sla, 30).map(({ clock, phase, at }) => [clock, phase, at])).toEqual([
      ['firstResponse', 'warning', ub('2026-11-09T10:30:00')],
      ['firstResponse', 'breached', ub('2026-11-09T11:00:00')],
      ['resolution', 'warning', ub('2026-11-09T13:30:00')],
      ['resolution', 'breached', ub('2026-11-09T14:00:00')],
    ]);
    expect(
      pendingSlaChecks({ ...sla, firstRespondedAt: ub('2026-11-09T10:10:00') }).map(
        ({ clock }) => clock,
      ),
    ).toEqual(['resolution']);
  });

  it('drops a check that was answered or whose due time moved', () => {
    const check = {
      clock: 'firstResponse' as const,
      phase: 'breached' as const,
      dueAt: ub('2026-11-09T11:00:00'),
    };

    expect(isSlaCheckDue(sla, check)).toBe(true);
    expect(
      isSlaCheckDue({ ...sla, firstRespondedAt: ub('2026-11-09T10:59:00') }, check),
    ).toBe(false);
    expect(
      isSlaCheckDue({ ...sla, firstResponseDueAt: ub('2026-11-09T12:00:00') }, check),
    ).toBe(false);
    // Resolved without a reply first: nobody is warned about a first response
    expect(
      isSlaCheckDue({ ...sla, resolvedAt: ub('2026-11-09T10:30:00') }, check),
    ).toBe(false);
  });
});

describe('normalizeSlaPolicy', () => {
  it('refuses unknown or repeated priorities and drops empty rules', () => {
    expect(() => normalizeSlaPolicy({ rules: [{ priority: 9 }] })).toThrow(
      'SLA priority 9 does not exist',
    );
    expect(() =>
      normalizeSlaPolicy({ rules: [{ priority: 1 }, { priority: 1 }] }),
    ).toThrow('Each priority can have one SLA rule');
    expect(
      normalizeSlaPolicy({
        enabled: true,
        rules: [{ priority: 1 }, { priority: 2, firstResponseMinutes: 90.4 }],
      }),
    ).toEqual({
      enabled: true,
      rules: [{ priority: 2, firstResponseMinutes: 90, resolutionMinutes: undefined }],
      warnBeforeMinutes: undefined,
    });
  });
});

describe('matchTicketSlaEvent', () => {
  const target = { pipelineId: 'p1' };

  it('names the mark an update added', () => {
    expect(
      matchTicketSlaEvent({
        target,
        eventUpdateDescription: { added: { sla: { resolutionBreachedAt: new Date() } } },
      }),
    ).toBe('resolution.breached');
  });

  it('keeps to the events and pipeline it listens for', () => {
    const eventUpdateDescription = {
      added: { sla: { firstResponseWarnedAt: new Date() } },
    };

    expect(
      matchTicketSlaEvent({
        target,
        config: { events: ['firstResponse.breached'] },
        eventUpdateDescription,
      }),
    ).toBeUndefined();
    expect(
      matchTicketSlaEvent({
        target,
        config: { pipelineId: 'p2' },
        eventUpdateDescription,
      }),
    ).toBeUndefined();
  });
});
