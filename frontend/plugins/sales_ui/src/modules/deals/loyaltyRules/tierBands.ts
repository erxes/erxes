export type TTierBand = { tier: string; min?: number; max?: number };

export type TLoyaltyTier = {
  key: string;
  name: string;
  order: number;
  deprecated?: boolean | null;
};

// What a purchase needs to pick a tier from its amount.
export type TTierBandsValue = {
  bands: TTierBand[];
  onlyUpgrade: boolean;
};

// One row per active tier, highest first, holding what was entered for it.
export const tierBandRows = (tiers: TLoyaltyTier[], bands: TTierBand[]) =>
  tiers
    .filter(({ deprecated }) => !deprecated)
    .sort((a, b) => b.order - a.order)
    .map(({ key, name }) => ({
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

// A range that starts above its end, or two ranges sharing amounts (the
// higher tier wins there): saved, but worth a warning.
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

// GraphQL hands back nulls; the form keeps an unset end undefined.
export const toTierBands = (
  bands?: { tier: string; min?: number | null; max?: number | null }[] | null,
): TTierBand[] =>
  (bands || []).map(({ tier, min, max }) => ({
    tier,
    min: min ?? undefined,
    max: max ?? undefined,
  }));
