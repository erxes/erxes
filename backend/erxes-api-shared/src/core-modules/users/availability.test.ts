import {
  readTeamAvailabilitySettings,
  resolveMemberAvailability,
} from './availability';

const now = new Date('2026-11-10T08:00:00Z');
const later = new Date('2026-11-10T12:00:00Z');
const earlier = new Date('2026-11-10T07:00:00Z');

describe('resolveMemberAvailability', () => {
  it('is available when nothing speaks', () => {
    expect(resolveMemberAvailability({}, {}, now)).toEqual({
      status: 'available',
      source: 'default',
    });
  });

  it('follows a declaration until it ends', () => {
    const member = {
      availability: { status: 'unavailable' as const, until: later, reason: 'Out' },
    };

    expect(resolveMemberAvailability(member, {}, now)).toMatchObject({
      status: 'unavailable',
      source: 'manual',
      reason: 'Out',
    });
    expect(
      resolveMemberAvailability(
        { availability: { status: 'unavailable', until: earlier } },
        {},
        now,
      ).source,
    ).toBe('default');
  });

  it('makes segment members unavailable', () => {
    const settings = { segmentId: 'busy' };

    expect(
      resolveMemberAvailability({ segmentIds: ['busy'] }, settings, now),
    ).toEqual({ status: 'unavailable', source: 'segment' });
    expect(
      resolveMemberAvailability({ segmentIds: ['other'] }, settings, now),
    ).toEqual({ status: 'available', source: 'segment' });
  });

  it('lets precedence settle a disagreement', () => {
    const member = {
      availability: { status: 'available' as const },
      segmentIds: ['busy'],
    };

    expect(
      resolveMemberAvailability(member, { segmentId: 'busy', precedence: 'segment' }, now)
        .status,
    ).toBe('unavailable');
    expect(
      resolveMemberAvailability(member, { segmentId: 'busy', precedence: 'manual' }, now)
        .status,
    ).toBe('available');
  });

  it('keeps the declaration when both agree', () => {
    expect(
      resolveMemberAvailability(
        { availability: { status: 'unavailable', reason: 'Errand' }, segmentIds: ['busy'] },
        { segmentId: 'busy' },
        now,
      ),
    ).toMatchObject({ source: 'manual', reason: 'Errand' });
  });
});

describe('readTeamAvailabilitySettings', () => {
  it('defaults to segment precedence and drops blanks', () => {
    expect(readTeamAvailabilitySettings(undefined)).toEqual({
      segmentId: undefined,
      precedence: 'segment',
    });
    expect(
      readTeamAvailabilitySettings({ segmentId: ' s1 ', precedence: 'manual' }),
    ).toEqual({ segmentId: 's1', precedence: 'manual' });
  });
});
