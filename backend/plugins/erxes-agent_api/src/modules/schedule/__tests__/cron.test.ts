import { validateCron, validateTimezone } from '../cron';

describe('validateCron', () => {
  it('accepts standard 5-field expressions and normalizes whitespace', () => {
    expect(validateCron('0 9 * * *')).toBe('0 9 * * *');
    expect(validateCron('  */15  *   * * 1-5 ')).toBe('*/15 * * * 1-5');
    expect(validateCron('0 9 1 * *')).toBe('0 9 1 * *');
  });

  it('accepts 6-field (seconds) expressions', () => {
    expect(validateCron('30 0 9 * * *')).toBe('30 0 9 * * *');
  });

  it('rejects empty and non-string input', () => {
    expect(() => validateCron('')).toThrow('required');
    expect(() => validateCron('   ')).toThrow('required');
    expect(() => validateCron()).toThrow('required');
    expect(() => validateCron({ $gt: '' })).toThrow('required');
  });

  it('rejects wrong field counts', () => {
    expect(() => validateCron('0 9 * *')).toThrow('5 or 6 fields');
    expect(() => validateCron('0 9 * * * * *')).toThrow('5 or 6 fields');
  });

  it('rejects fields with cron-unsafe characters', () => {
    expect(() => validateCron('0 9 * * $(rm)')).toThrow('Invalid cron field');
    expect(() => validateCron('0 9 * * {}')).toThrow('Invalid cron field');
  });
});

describe('validateTimezone', () => {
  it('defaults blank input to UTC', () => {
    expect(validateTimezone()).toBe('UTC');
    expect(validateTimezone(null)).toBe('UTC');
    expect(validateTimezone('')).toBe('UTC');
  });

  it('accepts valid IANA timezones', () => {
    expect(validateTimezone('UTC')).toBe('UTC');
    expect(validateTimezone('Asia/Ulaanbaatar')).toBe('Asia/Ulaanbaatar');
  });

  it('rejects unknown or non-string timezones', () => {
    expect(() => validateTimezone('Not/AZone')).toThrow('Unknown timezone');
    expect(() => validateTimezone(42)).toThrow('Invalid timezone');
  });
});
