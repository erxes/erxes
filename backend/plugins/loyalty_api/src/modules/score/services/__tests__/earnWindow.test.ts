import { heldPastReset } from '@/score/services/earnWindow';

jest.mock('@/score/services/periodSchedule', () => ({
  loyaltyTimeZone: jest.fn().mockResolvedValue('Asia/Ulaanbaatar'),
}));

const modelsWith = (accountType: Record<string, unknown> | null) =>
  ({
    LoyaltyAccountTypes: {
      findOne: () => ({ lean: async () => accountType }),
    },
  }) as never;

const WALLET = {
  expiry: { mode: 'calendar' },
  reset: { period: 'yearly' },
  pendingDays: 7,
};

describe('heldPastReset', () => {
  it('holds a Dec 31 purchase whose wait ends after the new year', async () => {
    const held = await heldPastReset({
      models: modelsWith(WALLET),
      subdomain: 'test',
      accountTypeId: 'wallet',
      now: new Date('2026-12-31T10:00:00+08:00'),
    });

    expect(held?.resetsAt.toISOString()).toBe('2026-12-31T16:00:00.000Z');
  });

  it('lets a purchase earn when its wait ends before the reset', async () => {
    await expect(
      heldPastReset({
        models: modelsWith(WALLET),
        subdomain: 'test',
        accountTypeId: 'wallet',
        now: new Date('2026-12-01T10:00:00+08:00'),
      }),
    ).resolves.toBeNull();
  });

  it('never holds without calendar expiry or a wait', async () => {
    for (const accountType of [
      { ...WALLET, expiry: { mode: 'rolling', months: 6 } },
      { ...WALLET, pendingDays: 0 },
    ]) {
      await expect(
        heldPastReset({
          models: modelsWith(accountType),
          subdomain: 'test',
          accountTypeId: 'wallet',
          now: new Date('2026-12-31T10:00:00+08:00'),
        }),
      ).resolves.toBeNull();
    }
  });
});
