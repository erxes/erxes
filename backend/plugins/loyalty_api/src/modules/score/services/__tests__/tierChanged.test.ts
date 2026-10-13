import {
  matchesTierChanged,
  tierDirection,
} from '@/score/services/tierChanged';

const TIERS = [
  { key: 'silver', name: 'Silver', order: 0 },
  { key: 'gold', name: 'Gold', order: 1 },
];

describe('tierDirection', () => {
  it('reads a move by tier order', () => {
    expect(tierDirection(TIERS, 'silver', 'gold')).toBe('up');
    expect(tierDirection(TIERS, 'gold', 'silver')).toBe('down');
  });

  it('treats gaining a first tier as up and losing it as down', () => {
    expect(tierDirection(TIERS, null, 'silver')).toBe('up');
    expect(tierDirection(TIERS, 'silver', null)).toBe('down');
  });
});

describe('matchesTierChanged', () => {
  const target = {
    accountTypeId: 'wallet',
    toTier: 'gold',
    direction: 'up' as const,
  };

  it('needs the wallet it was set up for', () => {
    expect(matchesTierChanged({}, target)).toBe(false);
    expect(matchesTierChanged({ accountTypeId: 'other' }, target)).toBe(false);
    expect(matchesTierChanged({ accountTypeId: 'wallet' }, target)).toBe(true);
  });

  it('narrows by tier and direction when given', () => {
    expect(
      matchesTierChanged({ accountTypeId: 'wallet', toTier: 'silver' }, target),
    ).toBe(false);
    expect(
      matchesTierChanged({ accountTypeId: 'wallet', direction: 'down' }, target),
    ).toBe(false);
    expect(
      matchesTierChanged(
        { accountTypeId: 'wallet', toTier: 'gold', direction: 'any' },
        target,
      ),
    ).toBe(true);
  });
});
