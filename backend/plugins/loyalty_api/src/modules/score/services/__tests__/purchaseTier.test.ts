import { tierForPurchase } from '@/score/services/purchaseTier';

const TIERS = [
  { key: 'silver', name: 'Silver', order: 0 },
  { key: 'gold', name: 'Gold', order: 1 },
];

describe('tierForPurchase', () => {
  it('gives the higher tier where ranges meet, whatever the band order', () => {
    const bands = [
      { tier: 'silver', min: 0, max: 1_000_000 },
      { tier: 'gold', min: 1_000_000 },
    ];

    expect(tierForPurchase(TIERS, { bands }, 1_000_000)).toEqual({
      tier: 'gold',
    });
    expect(
      tierForPurchase(TIERS, { bands: [...bands].reverse() }, 1_000_000),
    ).toEqual({ tier: 'gold' });
    expect(tierForPurchase(TIERS, { bands }, 999_999)).toEqual({
      tier: 'silver',
    });
  });

  it('skips an amount outside every band', () => {
    expect(
      tierForPurchase(TIERS, { bands: [{ tier: 'gold', min: 500 }] }, 100),
    ).toEqual({ skip: 'no-band', amount: 100 });
  });
});
