import { IActiveWindow } from '../../@types/schedule';
import {
  activeWindowAt,
  activeWindowOnClock,
  isPlanScheduledAt,
  matchScheduleMoment,
  scheduleMatchAt,
  scheduleTimesAt,
  wallClockFromLocal,
} from '../schedule';

const UB = 'Asia/Ulaanbaatar';
const HOVD = 'Asia/Hovd';

const evening: IActiveWindow = {
  type: 'daily',
  startTime: '18:00',
  endTime: '21:00',
};

const at = (
  local: string,
  activeWindows: IActiveWindow[],
  closedDates: string[] = [],
) =>
  !!activeWindowOnClock(
    { activeWindows, closedDates },
    wallClockFromLocal(local),
  );

// 2026-11-06 is a Friday.
describe('pricing schedule windows', () => {
  it('reads the organization wall clock, not the server zone', () => {
    // 10:30 UTC is 18:30 in Ulaanbaatar and 17:30 in Hovd.
    const moment = new Date('2026-11-06T10:30:00Z');
    const plan = { activeWindows: [evening] };

    expect(activeWindowAt(plan, moment, UB)).not.toBeNull();
    expect(activeWindowAt(plan, moment, HOVD)).toBeNull();
  });

  it('ends windows exclusive', () => {
    expect(at('2026-11-06T18:00', [evening])).toBe(true);
    expect(at('2026-11-06T20:59', [evening])).toBe(true);
    expect(at('2026-11-06T21:00', [evening])).toBe(false);
    expect(at('2026-11-06T17:59', [evening])).toBe(false);
  });

  it('runs a whole day with 24:00', () => {
    const allDay: IActiveWindow = {
      type: 'daily',
      startTime: '00:00',
      endTime: '24:00',
    };

    expect(at('2026-11-06T00:00', [allDay])).toBe(true);
    expect(at('2026-11-06T23:59', [allDay])).toBe(true);
  });

  it('matches weekly windows on their days and applies any window', () => {
    const windows: IActiveWindow[] = [
      { ...evening, type: 'weekly', weekDays: [1, 2, 3, 4, 5] },
      { type: 'weekly', weekDays: [6], startTime: '10:00', endTime: '12:00' },
    ];

    expect(at('2026-11-06T18:30', windows)).toBe(true);
    expect(at('2026-11-07T11:00', windows)).toBe(true);
    expect(at('2026-11-07T18:30', windows)).toBe(false);
    expect(at('2026-11-08T11:00', windows)).toBe(false);
  });

  it('runs past midnight on the day it starts', () => {
    const fridayNight: IActiveWindow = {
      type: 'weekly',
      weekDays: [5],
      startTime: '22:00',
      endTime: '02:00',
    };

    expect(at('2026-11-06T23:00', [fridayNight])).toBe(true);
    expect(at('2026-11-07T01:59', [fridayNight])).toBe(true);
    expect(at('2026-11-07T02:00', [fridayNight])).toBe(false);
    // Saturday's own late night is not Friday's window.
    expect(at('2026-11-07T23:00', [fridayNight])).toBe(false);
  });

  it('matches monthly windows and looks back across a month end', () => {
    const lastNight: IActiveWindow = {
      type: 'monthly',
      monthDays: [31],
      startTime: '22:00',
      endTime: '02:00',
    };
    const lunch: IActiveWindow = {
      type: 'monthly',
      monthDays: [1, 15],
      startTime: '12:00',
      endTime: '14:00',
    };

    // Looks back to 31 October, then to 30 September.
    expect(at('2026-11-01T01:00', [lastNight])).toBe(true);
    expect(at('2026-10-01T01:00', [lastNight])).toBe(false);
    expect(at('2026-11-15T12:30', [lunch])).toBe(true);
    expect(at('2026-11-16T12:30', [lunch])).toBe(false);
  });

  it('matches yearly ranges, including ones that wrap the new year', () => {
    const summer: IActiveWindow = {
      type: 'yearly',
      fromMonthDay: '06-01',
      toMonthDay: '08-31',
      startTime: '00:00',
      endTime: '24:00',
    };
    const holidays: IActiveWindow = {
      ...summer,
      fromMonthDay: '12-15',
      toMonthDay: '01-15',
    };

    expect(at('2027-08-31T10:00', [summer])).toBe(true);
    expect(at('2027-09-01T10:00', [summer])).toBe(false);
    expect(at('2026-12-20T10:00', [holidays])).toBe(true);
    expect(at('2027-01-10T10:00', [holidays])).toBe(true);
    expect(at('2027-01-16T10:00', [holidays])).toBe(false);
  });

  it('keeps closed dates shut, by the day a window starts', () => {
    const night: IActiveWindow = {
      type: 'daily',
      startTime: '22:00',
      endTime: '02:00',
    };

    expect(at('2026-12-31T23:00', [night], ['2026-12-31'])).toBe(false);
    expect(at('2027-01-01T01:00', [night], ['2026-12-31'])).toBe(false);
    expect(at('2026-12-31T01:00', [night], ['2026-12-31'])).toBe(true);
  });

  it('refuses malformed local times', () => {
    expect(() => wallClockFromLocal('2026-11-06 18:00')).toThrow();
    expect(() => wallClockFromLocal('2026-02-30T18:00')).toThrow();
    expect(() => wallClockFromLocal('2026-11-06T24:00')).toThrow();
  });
});

describe('pricing schedule moments', () => {
  const holds = (moment: string) => moment === 'in';

  it('checks the moment the plan chose', () => {
    const moments = { checkout: 'out', orderCreated: 'in' };

    expect(matchScheduleMoment('checkout', moments, holds)).toBeNull();
    expect(matchScheduleMoment(undefined, moments, holds)).toBeNull();
    expect(matchScheduleMoment('orderCreated', moments, holds)).toBe(
      'orderCreated',
    );
    expect(matchScheduleMoment('either', moments, holds)).toBe('orderCreated');
    expect(
      matchScheduleMoment(
        'either',
        { checkout: 'in', orderCreated: 'out' },
        holds,
      ),
    ).toBe('checkout');
  });

  it('uses checkout as the order start when none is given', () => {
    expect(matchScheduleMoment('orderCreated', { checkout: 'in' }, holds)).toBe(
      'orderCreated',
    );
  });

  it('passes plans without a schedule and fails an empty one', () => {
    const moment = { checkout: new Date('2026-11-06T10:30:00Z') };

    expect(isPlanScheduledAt({ isRepeatEnabled: false }, moment, UB)).toBe(
      true,
    );
    expect(
      isPlanScheduledAt(
        { isRepeatEnabled: true, activeWindows: [] },
        moment,
        UB,
      ),
    ).toBe(false);
  });
});

describe('pricing schedule times', () => {
  // 2026-11-06 is a Friday; Ulaanbaatar is UTC+8.
  const ub = (local: string) => new Date(`${local}:00+08:00`);
  const evening = {
    activeWindows: [
      { type: 'daily' as const, startTime: '18:00', endTime: '21:00' },
    ],
  };

  it('gives when the open window closes', () => {
    const times = scheduleTimesAt(evening, ub('2026-11-06T20:50'), UB);

    expect(times.current?.endsAt.toISOString()).toBe(
      ub('2026-11-06T21:00').toISOString(),
    );
    expect(times.startsAt?.toISOString()).toBe(
      ub('2026-11-07T18:00').toISOString(),
    );
  });

  it('gives the window that closed today and the next start', () => {
    const times = scheduleTimesAt(evening, ub('2026-11-06T21:30'), UB);

    expect(times.current).toBeNull();
    expect(times.endedAt?.toISOString()).toBe(
      ub('2026-11-06T21:00').toISOString(),
    );
    expect(times.startsAt?.toISOString()).toBe(
      ub('2026-11-07T18:00').toISOString(),
    );
  });

  it('closes an overnight window the next morning', () => {
    const night = {
      activeWindows: [
        {
          type: 'weekly' as const,
          weekDays: [5],
          startTime: '22:00',
          endTime: '02:00',
        },
      ],
    };

    expect(
      scheduleTimesAt(
        night,
        ub('2026-11-07T01:00'),
        UB,
      ).current?.endsAt.toISOString(),
    ).toBe(ub('2026-11-07T02:00').toISOString());
    expect(
      scheduleTimesAt(
        night,
        ub('2026-11-07T03:00'),
        UB,
      ).startsAt?.toISOString(),
    ).toBe(ub('2026-11-13T22:00').toISOString());
  });

  it('skips closed days and finds a yearly start months ahead', () => {
    const closed = { ...evening, closedDates: ['2026-11-07'] };

    expect(
      scheduleTimesAt(
        closed,
        ub('2026-11-06T22:00'),
        UB,
      ).startsAt?.toISOString(),
    ).toBe(ub('2026-11-08T18:00').toISOString());

    const summer = {
      activeWindows: [
        {
          type: 'yearly' as const,
          fromMonthDay: '06-01',
          toMonthDay: '08-31',
          startTime: '00:00',
          endTime: '24:00',
        },
      ],
    };

    expect(
      scheduleTimesAt(
        summer,
        ub('2026-11-06T10:00'),
        UB,
      ).startsAt?.toISOString(),
    ).toBe(ub('2027-06-01T00:00').toISOString());
  });

  it('reads Hovd times in its own zone', () => {
    const times = scheduleTimesAt(
      evening,
      new Date('2026-11-06T13:30:00Z'),
      HOVD,
    );

    // 13:30 UTC is 20:30 in Hovd, so the 21:00 close is 14:00 UTC.
    expect(times.current?.endsAt.toISOString()).toBe(
      '2026-11-06T14:00:00.000Z',
    );
  });
});

describe('pricing schedule match', () => {
  it('names the moment and window that matched', () => {
    const plan = {
      isRepeatEnabled: true,
      scheduleMoment: 'orderCreated' as const,
      activeWindows: [
        { type: 'daily' as const, startTime: '18:00', endTime: '21:00' },
      ],
    };
    const match = scheduleMatchAt(
      plan,
      {
        checkout: new Date('2026-11-06T13:10:00Z'),
        orderCreated: new Date('2026-11-06T12:50:00Z'),
      },
      UB,
    );

    expect(match?.moment).toBe('orderCreated');
    expect(match?.window.startTime).toBe('18:00');
  });
});
