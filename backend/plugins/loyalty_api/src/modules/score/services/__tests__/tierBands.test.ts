import { tierForAmount } from '@/score/services/tierBands';

const bands = [
  { tier: 'gold', min: 2_000_000 },
  { tier: 'silver', min: 1_000_000, max: 1_999_999 },
  { tier: 'bronze', min: 500_000, max: 999_999 },
];

describe('tierForAmount', () => {
  it('finds the band an amount falls in, ends included', () => {
    expect(tierForAmount({ bands }, 500_000)).toEqual({ tier: 'bronze' });
    expect(tierForAmount({ bands }, 1_999_999)).toEqual({ tier: 'silver' });
    expect(tierForAmount({ bands }, 9_000_000)).toEqual({ tier: 'gold' });
  });

  it('says so when no band holds the amount', () => {
    expect(tierForAmount({ bands }, 100)).toEqual({
      skip: 'no-band',
      amount: 100,
    });
  });

  it('needs an amount from the purchase', () => {
    expect(tierForAmount({ bands }, undefined)).toEqual({ skip: 'no-amount' });
  });

  it('runs only between its dates', () => {
    const config = {
      bands,
      startDate: '2026-01-01T00:00:00Z',
      endDate: '2026-12-31T23:59:59Z',
    };

    expect(
      tierForAmount(config, 600_000, new Date('2025-12-31T00:00:00Z')),
    ).toEqual({ skip: 'outside-dates' });
    expect(
      tierForAmount(config, 600_000, new Date('2026-06-01T00:00:00Z')),
    ).toEqual({ tier: 'bronze' });
  });
});
