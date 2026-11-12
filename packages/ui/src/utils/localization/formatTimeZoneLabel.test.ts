import { describe, expect, it } from 'vite-plus/test';
import { formatTimeZoneLabel } from './formatTimeZoneLabel';

describe('formatTimeZoneLabel', () => {
  it('names the offset and zone, adding the city when the name lacks it', () => {
    expect(formatTimeZoneLabel('Asia/Ulaanbaatar')).toBe('(GMT+08:00) Ulaanbaatar Standard Time');
    expect(formatTimeZoneLabel('Asia/Tokyo')).toBe('(GMT+09:00) Japan Standard Time - Tokyo');
  });

  it('shows the offset once for zones without a name', () => {
    expect(formatTimeZoneLabel('Etc/GMT-3')).toBe('(GMT+03:00) - GMT-3');
  });

  it('throws for an unknown zone', () => {
    expect(() => formatTimeZoneLabel('Mars/Olympus')).toThrow(RangeError);
  });
});
