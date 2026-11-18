import {
  addWorkingTime,
  isWorkingMoment,
  nextWorkingMoment,
  TWorkingCalendar,
} from './workingCalendar';

// Ulaanbaatar has no daylight saving: local = UTC+8 all year.
const weekday = {
  inactive: false,
  startFrom: '09:00',
  endTo: '18:00',
  lunchStartFrom: '13:00',
  lunchEndTo: '14:00',
};

const calendar: TWorkingCalendar = {
  timeZone: 'Asia/Ulaanbaatar',
  workhours: {
    Monday: weekday,
    Tuesday: weekday,
    Wednesday: weekday,
    Thursday: weekday,
    Friday: weekday,
  },
  holidays: [
    { startDate: '2026-07-11', endDate: '2026-07-13' },
    { startDate: '2026-12-31', startFrom: '09:00', endTo: '12:00' },
  ],
};

// Local wall-clock time in Ulaanbaatar, as an instant.
const ub = (local: string) => new Date(`${local}+08:00`);

describe('nextWorkingMoment', () => {
  it('keeps a moment inside working hours', () => {
    expect(nextWorkingMoment(calendar, ub('2026-11-09T10:15:00'))).toEqual(
      ub('2026-11-09T10:15:00'),
    );
    expect(isWorkingMoment(calendar, ub('2026-11-09T10:15:00'))).toBe(true);
  });

  it('skips lunch, the night and the weekend', () => {
    expect(nextWorkingMoment(calendar, ub('2026-11-09T13:20:00'))).toEqual(
      ub('2026-11-09T14:00:00'),
    );
    expect(nextWorkingMoment(calendar, ub('2026-11-09T19:00:00'))).toEqual(
      ub('2026-11-10T09:00:00'),
    );
    expect(nextWorkingMoment(calendar, ub('2026-11-14T11:00:00'))).toEqual(
      ub('2026-11-16T09:00:00'),
    );
  });

  it('skips a holiday and keeps a shortened one', () => {
    // Naadam: Saturday 11th to Monday 13th, back on Tuesday.
    expect(nextWorkingMoment(calendar, ub('2026-07-13T10:00:00'))).toEqual(
      ub('2026-07-14T09:00:00'),
    );
    expect(nextWorkingMoment(calendar, ub('2026-12-31T12:30:00'))).toEqual(
      ub('2027-01-01T09:00:00'),
    );
  });

  it('says nothing without working time', () => {
    const at = ub('2026-11-14T11:00:00');

    expect(nextWorkingMoment({ timeZone: 'UTC' }, at)).toEqual(at);
    expect(nextWorkingMoment(null, at)).toEqual(at);
  });
});

describe('addWorkingTime', () => {
  it('counts only open hours', () => {
    // 4 working hours from Monday 11:00: 2h before lunch, 2h after.
    expect(addWorkingTime(calendar, ub('2026-11-09T11:00:00'), 240)).toEqual(
      ub('2026-11-09T16:00:00'),
    );
    // Friday 17:00 + 2h → Monday 10:00.
    expect(addWorkingTime(calendar, ub('2026-11-13T17:00:00'), 120)).toEqual(
      ub('2026-11-16T10:00:00'),
    );
  });

  it('starts counting at the next opening', () => {
    expect(addWorkingTime(calendar, ub('2026-11-08T20:00:00'), 30)).toEqual(
      ub('2026-11-09T09:30:00'),
    );
  });

  it('is clock time without a calendar', () => {
    expect(addWorkingTime(undefined, ub('2026-11-08T20:00:00'), 30)).toEqual(
      ub('2026-11-08T20:30:00'),
    );
  });
});
