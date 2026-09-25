import {
  canResend,
  resendableFilter,
} from '@/integrations/mail/utils/delivery';

const NOW = new Date('2026-09-25T05:00:00.000Z').getTime();

const minutesAgo = (minutes: number) => new Date(NOW - minutes * 60 * 1000);

describe('canResend', () => {
  it('allows a failed message', () => {
    expect(
      canResend({ deliveryStatus: 'failed', createdAt: minutesAgo(1) }, NOW),
    ).toBe(true);
  });

  it('refuses a message that is still being sent', () => {
    expect(
      canResend(
        {
          deliveryStatus: 'pending',
          deliveryAttemptedAt: minutesAgo(2),
          createdAt: minutesAgo(30),
        },
        NOW,
      ),
    ).toBe(false);
  });

  it('allows a message stuck sending for more than ten minutes', () => {
    expect(
      canResend(
        {
          deliveryStatus: 'pending',
          deliveryAttemptedAt: minutesAgo(11),
          createdAt: minutesAgo(11),
        },
        NOW,
      ),
    ).toBe(true);
  });

  it('falls back to createdAt for a message written before attempts were tracked', () => {
    expect(
      canResend({ deliveryStatus: 'pending', createdAt: minutesAgo(20) }, NOW),
    ).toBe(true);
  });

  it('refuses a delivered or bounced message', () => {
    expect(
      canResend({ deliveryStatus: 'sent', createdAt: minutesAgo(60) }, NOW),
    ).toBe(false);
    expect(
      canResend({ deliveryStatus: 'bounced', createdAt: minutesAgo(60) }, NOW),
    ).toBe(false);
  });
});

describe('resendableFilter', () => {
  it('claims failed messages and pending ones older than ten minutes', () => {
    const staleBefore = minutesAgo(10);

    expect(resendableFilter(NOW)).toEqual({
      $or: [
        { deliveryStatus: 'failed' },
        {
          deliveryStatus: 'pending',
          deliveryAttemptedAt: { $lt: staleBefore },
        },
        {
          deliveryStatus: 'pending',
          deliveryAttemptedAt: { $exists: false },
          createdAt: { $lt: staleBefore },
        },
      ],
    });
  });
});
