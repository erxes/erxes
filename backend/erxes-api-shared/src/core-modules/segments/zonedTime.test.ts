import {
  anniversaryRanges,
  isAnniversary,
  shiftZonedDays,
  zonedDate,
  zonedDayStart,
  zonedPeriodRange,
} from './zonedTime';

const UB = 'Asia/Ulaanbaatar';

describe('zonedDate', () => {
  it('reads the day the organization is on, not the UTC one', () => {
    expect(zonedDate(new Date('2026-08-31T16:30:00Z'), UB)).toEqual({
      year: 2026,
      month: 9,
      day: 1,
    });

    expect(zonedDate(new Date('2026-08-31T16:30:00Z'), 'UTC')).toEqual({
      year: 2026,
      month: 8,
      day: 31,
    });
  });
});

describe('zonedDayStart', () => {
  it('returns the instant the local day begins', () => {
    expect(
      zonedDayStart({ year: 2026, month: 9, day: 1 }, UB).toISOString(),
    ).toBe('2026-08-31T16:00:00.000Z');
  });

  it('handles a zone whose clocks move', () => {
    expect(
      zonedDayStart(
        { year: 2026, month: 9, day: 1 },
        'America/New_York',
      ).toISOString(),
    ).toBe('2026-09-01T04:00:00.000Z');

    expect(
      zonedDayStart(
        { year: 2026, month: 12, day: 1 },
        'America/New_York',
      ).toISOString(),
    ).toBe('2026-12-01T05:00:00.000Z');
  });
});

describe('shiftZonedDays', () => {
  it('crosses months and years', () => {
    expect(shiftZonedDays({ year: 2026, month: 8, day: 31 }, 1)).toEqual({
      year: 2026,
      month: 9,
      day: 1,
    });

    expect(shiftZonedDays({ year: 2026, month: 1, day: 1 }, -1)).toEqual({
      year: 2025,
      month: 12,
      day: 31,
    });
  });
});

describe('anniversaryRanges', () => {
  const covers = (
    ranges: { gte: Date; lt: Date }[],
    instant: string,
  ): boolean =>
    ranges.some(
      (range) => new Date(instant) >= range.gte && new Date(instant) < range.lt,
    );

  it('matches the same day in every year', () => {
    const ranges = anniversaryRanges({ year: 2026, month: 9, day: 7 }, UB);

    expect(covers(ranges, '1980-09-06T16:00:00Z')).toBe(true);
    expect(covers(ranges, '2001-09-07T03:00:00Z')).toBe(true);
    expect(covers(ranges, '1980-09-07T16:00:00Z')).toBe(false);
  });

  it('never rolls February 29th onto March 1st', () => {
    const ranges = anniversaryRanges({ year: 2028, month: 2, day: 29 }, UB);

    expect(covers(ranges, '1996-02-28T16:00:00Z')).toBe(true); // Feb 29 1996
    expect(covers(ranges, '1997-02-28T16:00:00Z')).toBe(false); // Mar 1 1997
    expect(covers(ranges, '1997-02-27T16:00:00Z')).toBe(false); // Feb 28 1997
  });

  it('celebrates a February 29th birthday on the 28th in a common year', () => {
    const ranges = anniversaryRanges({ year: 2027, month: 2, day: 28 }, UB);

    expect(covers(ranges, '1997-02-27T16:00:00Z')).toBe(true); // Feb 28 1997
    expect(covers(ranges, '1996-02-28T16:00:00Z')).toBe(true); // Feb 29 1996
  });

  it('leaves it on its own day in a leap year', () => {
    const ranges = anniversaryRanges({ year: 2028, month: 2, day: 28 }, UB);

    expect(covers(ranges, '1997-02-27T16:00:00Z')).toBe(true); // Feb 28 1997
    expect(covers(ranges, '1996-02-28T16:00:00Z')).toBe(false); // Feb 29 1996
  });
});

describe('isAnniversary', () => {
  it('agrees with the ranges on the February 29th fold', () => {
    const born = new Date('1996-02-28T16:00:00Z'); // Feb 29 1996, UB

    expect(isAnniversary(born, { year: 2027, month: 2, day: 28 }, UB)).toBe(
      true,
    );
    expect(isAnniversary(born, { year: 2028, month: 2, day: 28 }, UB)).toBe(
      false,
    );
    expect(isAnniversary(born, { year: 2028, month: 2, day: 29 }, UB)).toBe(
      true,
    );
  });
});

describe('zonedPeriodRange', () => {
  const at = (iso: string, period: 'month' | 'quarter' | 'year', zone = UB) => {
    const { gte, lt } = zonedPeriodRange(new Date(iso), zone, period);

    return [gte.toISOString(), lt.toISOString()];
  };

  it('holds the whole local month, quarter or year around now', () => {
    expect(at('2026-10-08T03:00:00Z', 'month')).toEqual([
      '2026-09-30T16:00:00.000Z',
      '2026-10-31T16:00:00.000Z',
    ]);
    expect(at('2026-10-08T03:00:00Z', 'quarter')).toEqual([
      '2026-09-30T16:00:00.000Z',
      '2026-12-31T16:00:00.000Z',
    ]);
    expect(at('2026-10-08T03:00:00Z', 'year')).toEqual([
      '2025-12-31T16:00:00.000Z',
      '2026-12-31T16:00:00.000Z',
    ]);
  });

  it('rolls over into the next year at the end of December', () => {
    expect(at('2026-12-15T00:00:00Z', 'month', 'UTC')).toEqual([
      '2026-12-01T00:00:00.000Z',
      '2027-01-01T00:00:00.000Z',
    ]);
    expect(at('2026-12-15T00:00:00Z', 'quarter', 'UTC')).toEqual([
      '2026-10-01T00:00:00.000Z',
      '2027-01-01T00:00:00.000Z',
    ]);
  });

  it("takes the period of the organization's day, not the UTC one", () => {
    expect(at('2026-08-31T17:00:00Z', 'month')).toEqual([
      '2026-08-31T16:00:00.000Z',
      '2026-09-30T16:00:00.000Z',
    ]);
  });
});
