export const DEFAULT_PASSENGER_TYPES = ['adult', 'child', 'infant'] as const;

export type DefaultPassengerType = (typeof DEFAULT_PASSENGER_TYPES)[number];
export type PassengerType = DefaultPassengerType | (string & {});

export interface PricingOptionPrice {
  type: PassengerType;
  price?: number | string;
}

export interface PricingOptionWithPrices {
  minPersons?: number | string;
  maxPersons?: number | string;
  prices?: PricingOptionPrice[];
  pricePerPerson?: number | string;
  domesticFlightPerPerson?: number | string;
  singleSupplement?: number | string;
}

export type PassengerCounts = Partial<Record<PassengerType, number>>;

type NormalizedPricingOptionForForm<T extends PricingOptionWithPrices> = Omit<
  T,
  'prices' | 'pricePerPerson' | '__typename'
> & {
  prices: PricingOptionPrice[];
  pricePerPerson?: number;
};

export const PASSENGER_PRICE_FIELDS: Array<{
  type: DefaultPassengerType;
  label: string;
  required: boolean;
}> = [
  { type: 'adult', label: 'Adult price', required: true },
  { type: 'child', label: 'Child price', required: false },
  { type: 'infant', label: 'Infant price', required: false },
];

const normalizePassengerType = (type?: string) =>
  (type || '').trim().toLowerCase();

const toNumberOrUndefined = (value: unknown): number | undefined => {
  if (value === '' || value === null || value === undefined) return undefined;
  const numberValue = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
};

const stripTypename = <T extends object>(value: T): Omit<T, '__typename'> => {
  const rest = { ...(value as T & { __typename?: unknown }) };
  delete rest.__typename;
  return rest;
};

export const getDefaultPricingOptionPrices = (
  adultPrice: number | string | undefined = '',
): PricingOptionPrice[] =>
  DEFAULT_PASSENGER_TYPES.map((type) => ({
    type,
    price: type === 'adult' ? adultPrice : '',
  }));

export const getPassengerPrice = (
  pricingOption: PricingOptionWithPrices | undefined,
  passengerType: PassengerType,
): number | undefined => {
  if (!pricingOption) return undefined;

  const normalizedType = normalizePassengerType(passengerType);
  const matchedPrice = pricingOption.prices?.find(
    (price) => normalizePassengerType(String(price.type)) === normalizedType,
  );

  if (matchedPrice) {
    return toNumberOrUndefined(matchedPrice.price);
  }

  if (normalizedType === 'adult') {
    return toNumberOrUndefined(pricingOption.pricePerPerson);
  }

  return undefined;
};

export const normalizePricingOptionForForm = <
  T extends PricingOptionWithPrices,
>(
  option: T,
): NormalizedPricingOptionForForm<T> => {
  const cleanOption = stripTypename(option);
  const pricingOption: PricingOptionWithPrices = cleanOption;
  const priceMap = new Map<string, PricingOptionPrice>();

  for (const price of pricingOption.prices ?? []) {
    const cleanPrice = stripTypename(price);
    const type = normalizePassengerType(String(cleanPrice.type));
    if (!type) continue;

    priceMap.set(type, {
      type,
      price: cleanPrice.price ?? '',
    });
  }

  if (!priceMap.has('adult') && pricingOption.pricePerPerson !== undefined) {
    priceMap.set('adult', {
      type: 'adult',
      price: pricingOption.pricePerPerson,
    });
  }

  const prices: PricingOptionPrice[] = DEFAULT_PASSENGER_TYPES.map((type) => ({
    type,
    price: priceMap.get(type)?.price ?? '',
  }));

  for (const [type, price] of priceMap.entries()) {
    if (!DEFAULT_PASSENGER_TYPES.includes(type as DefaultPassengerType)) {
      prices.push(price);
    }
  }

  return {
    ...cleanOption,
    prices,
    pricePerPerson: getPassengerPrice({ ...pricingOption, prices }, 'adult'),
  } as NormalizedPricingOptionForForm<T>;
};

export const sanitizePricingOptionForSubmit = <
  T extends PricingOptionWithPrices,
>(
  option: T,
): Omit<
  T,
  | 'prices'
  | 'pricePerPerson'
  | 'minPersons'
  | 'maxPersons'
  | 'domesticFlightPerPerson'
  | 'singleSupplement'
> & {
  minPersons: number;
  maxPersons?: number;
  domesticFlightPerPerson?: number;
  singleSupplement?: number;
  prices: Array<{ type: string; price: number }>;
  pricePerPerson?: number;
} => {
  const normalized = normalizePricingOptionForForm(option);
  const prices = normalized.prices
    .map((price) => ({
      type: normalizePassengerType(String(price.type)),
      price: toNumberOrUndefined(price.price),
    }))
    .filter(
      (price): price is { type: string; price: number } =>
        Boolean(price.type) && typeof price.price === 'number',
    );

  const adultPrice = prices.find((price) => price.type === 'adult')?.price;

  return {
    ...normalized,
    minPersons: toNumberOrUndefined(normalized.minPersons) ?? 1,
    maxPersons: toNumberOrUndefined(normalized.maxPersons),
    domesticFlightPerPerson: toNumberOrUndefined(
      normalized.domesticFlightPerPerson,
    ),
    singleSupplement: toNumberOrUndefined(normalized.singleSupplement),
    prices,
    pricePerPerson: adultPrice,
  } as Omit<
    T,
    | 'prices'
    | 'pricePerPerson'
    | 'minPersons'
    | 'maxPersons'
    | 'domesticFlightPerPerson'
    | 'singleSupplement'
  > & {
    minPersons: number;
    maxPersons?: number;
    domesticFlightPerPerson?: number;
    singleSupplement?: number;
    prices: Array<{ type: string; price: number }>;
    pricePerPerson?: number;
  };
};

export const calculateTourBookingTotal = ({
  pricingOption,
  passengerCounts,
  includeDomesticFlight = true,
  singleSupplementCount = 0,
}: {
  pricingOption: PricingOptionWithPrices;
  passengerCounts: PassengerCounts;
  includeDomesticFlight?: boolean;
  singleSupplementCount?: number;
}): number => {
  const passengerTotal = Object.entries(passengerCounts).reduce<number>(
    (total, [type, rawCount]) => {
      const count = Math.max(0, Number(rawCount || 0));
      if (!count) return total;

      const price = getPassengerPrice(pricingOption, type);
      if (typeof price !== 'number') {
        throw new Error(`Missing price for passenger type "${type}"`);
      }

      return total + price * count;
    },
    0,
  );

  const passengerCount = Object.values(passengerCounts).reduce<number>(
    (total, rawCount) => total + Math.max(0, Number(rawCount || 0)),
    0,
  );

  const domesticFlightTotal =
    includeDomesticFlight &&
    typeof pricingOption.domesticFlightPerPerson === 'number'
      ? pricingOption.domesticFlightPerPerson * passengerCount
      : 0;

  const singleSupplementTotal =
    typeof pricingOption.singleSupplement === 'number'
      ? pricingOption.singleSupplement * Math.max(0, singleSupplementCount)
      : 0;

  return passengerTotal + domesticFlightTotal + singleSupplementTotal;
};
