import { getAutoArchiveDate } from './getAutoArchiveDate';

describe('getAutoArchiveDate', () => {
  it('clears a stale date when auto-archive is disabled', () => {
    const staleDate = new Date('2026-07-21T09:00:00.000Z');

    expect(getAutoArchiveDate(false, staleDate)).toBeNull();
  });

  it('keeps the selected date when auto-archive is enabled', () => {
    const selectedDate = new Date('2026-07-22T10:00:00.000Z');

    expect(getAutoArchiveDate(true, selectedDate)).toBe(selectedDate);
  });
});
