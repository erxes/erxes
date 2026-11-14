import {
  readWaitEventTimeoutMinutes,
  WAIT_EVENT_MAX_TIMEOUT_MINUTES,
} from './coreActionConfigSchemas';

describe('readWaitEventTimeoutMinutes', () => {
  it('waits until the event without a usable timeout', () => {
    expect(readWaitEventTimeoutMinutes(undefined)).toBeUndefined();
    expect(readWaitEventTimeoutMinutes({ value: 0, unit: 'days' })).toBeUndefined();
    expect(readWaitEventTimeoutMinutes({ value: '2', unit: 'weeks' })).toBeUndefined();
  });

  it('converts units, text included', () => {
    expect(readWaitEventTimeoutMinutes({ value: 15, unit: 'minutes' })).toBe(15);
    expect(readWaitEventTimeoutMinutes({ value: '3', unit: 'hours' })).toBe(180);
    expect(readWaitEventTimeoutMinutes({ value: 2, unit: 'days' })).toBe(2880);
  });

  it('caps at 30 days', () => {
    expect(readWaitEventTimeoutMinutes({ value: 90, unit: 'days' })).toBe(
      WAIT_EVENT_MAX_TIMEOUT_MINUTES,
    );
  });
});
