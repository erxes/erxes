import { notificationDateLabel } from '../notificationDateLabel';

describe('notification date labels', () => {
  const now = new Date(2026, 9, 23, 0, 5);

  it('uses calendar days rather than elapsed hours around midnight', () => {
    expect(
      notificationDateLabel(
        new Date(2026, 9, 23, 0, 1).toISOString(),
        'en',
        now,
      ),
    ).toBe('today');
    expect(
      notificationDateLabel(
        new Date(2026, 9, 22, 23, 55).toISOString(),
        'en',
        now,
      ),
    ).toBe('yesterday');
  });

  it('localizes relative labels in Mongolian', () => {
    expect(notificationDateLabel(now.toISOString(), 'mn', now)).toBe('өнөөдөр');
  });

  it('keeps older dates concise and includes a different year', () => {
    expect(
      notificationDateLabel(new Date(2026, 9, 21).toISOString(), 'en-US', now),
    ).toBe('Oct 21');
    expect(
      notificationDateLabel(new Date(2025, 9, 21).toISOString(), 'en-US', now),
    ).toBe('Oct 21, 2025');
  });

  it('does not turn malformed timestamps into an Invalid Date label', () => {
    expect(notificationDateLabel('unknown date', 'en', now)).toBe(
      'unknown date',
    );
  });
});
