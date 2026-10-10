export type TTierBand = {
  tier: string;
  min?: number | null;
  max?: number | null;
};

export type TTierBandsConfig = {
  bands?: TTierBand[];
  startDate?: string | Date | null;
  endDate?: string | Date | null;
};

export type TTierBandOutcome =
  | { tier: string }
  | { skip: 'outside-dates' | 'no-amount' | 'no-band'; amount?: number };

const isSet = (value?: number | null): value is number =>
  value !== undefined && value !== null && !Number.isNaN(Number(value));

// Which tier one purchase of `amount` earns: the band holding it, inclusive
// at both ends, within the dates the rule runs. The first band that fits wins.
export const tierForAmount = (
  { bands = [], startDate, endDate }: TTierBandsConfig,
  amount: unknown,
  now: Date = new Date(),
): TTierBandOutcome => {
  if (
    (startDate && now < new Date(startDate)) ||
    (endDate && now > new Date(endDate))
  ) {
    return { skip: 'outside-dates' };
  }

  const value = Number(amount);

  if (
    amount === undefined ||
    amount === null ||
    amount === '' ||
    Number.isNaN(value)
  ) {
    return { skip: 'no-amount' };
  }

  const band = bands.find(
    ({ min, max }) =>
      (!isSet(min) || value >= Number(min)) &&
      (!isSet(max) || value <= Number(max)),
  );

  return band ? { tier: band.tier } : { skip: 'no-band', amount: value };
};
