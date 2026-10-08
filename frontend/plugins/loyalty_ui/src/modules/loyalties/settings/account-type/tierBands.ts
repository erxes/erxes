import { activeTiers, ILoyaltyTier } from './types';

export type TTierBand = { tier: string; min?: number; max?: number };

// What a Set tier step needs to pick a tier from one purchase's amount.
export type TTierBandsValue = {
  bands: TTierBand[];
  startDate?: string;
  endDate?: string;
  onlyUpgrade: boolean;
};

export const EMPTY_TIER_BANDS: TTierBandsValue = {
  bands: [],
  onlyUpgrade: true,
};

// One row per active tier, highest first, holding what was entered for it.
export const tierBandRows = (
  tiers: ILoyaltyTier[] | null | undefined,
  bands: TTierBand[],
) =>
  [...activeTiers(tiers)].reverse().map(({ key, name }) => ({
    key,
    name,
    band: bands.find(({ tier }) => tier === key),
  }));

// A band with neither end would take every amount, so it is left out.
export const setTierBand = (
  bands: TTierBand[],
  tier: string,
  end: 'min' | 'max',
  value?: number | '',
): TTierBand[] => {
  const amount = value === '' || value === undefined ? undefined : value;
  const current = bands.find((band) => band.tier === tier) || { tier };
  const next = { ...current, [end]: amount };
  const others = bands.filter((band) => band.tier !== tier);

  return next.min === undefined && next.max === undefined
    ? others
    : [...others, next];
};

export type TTierBandIssue = 'inverted' | 'overlap';

// What would make a purchase land somewhere unexpected: a range that starts
// above its end, or two ranges sharing amounts (the first one listed wins).
export const tierBandsIssue = (bands: TTierBand[]): TTierBandIssue | null => {
  const ranges = bands.map(({ min, max }) => ({
    min: min ?? -Infinity,
    max: max ?? Infinity,
  }));

  if (ranges.some(({ min, max }) => min > max)) {
    return 'inverted';
  }

  const sorted = [...ranges].sort((a, b) => a.min - b.min);

  return sorted.some(
    (range, index) => index > 0 && range.min <= sorted[index - 1].max,
  )
    ? 'overlap'
    : null;
};
