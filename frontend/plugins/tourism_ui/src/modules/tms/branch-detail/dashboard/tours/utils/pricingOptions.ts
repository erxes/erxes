import { nanoid } from 'nanoid';

import type { TourFormValues } from '../constants/formSchema';
import type { IPricingOption } from '../hooks/useTourDetail';
import { compactList } from '~/utils/cursorList';

export type PassengerType = 'adult' | 'child' | 'infant';

export interface PricingOptionPriceInput {
  type: PassengerType;
  price: number;
}

export interface PricingOptionInput {
  _id: string;
  title: string;
  minPersons: number;
  maxPersons?: number;
  prices: PricingOptionPriceInput[];
  accommodationType?: string;
  domesticFlightPerPerson?: number;
  singleSupplement?: number;
  note?: string;
}

type PricingOptionFormValue = TourFormValues['pricingOptions'][number];

const toOptionalNumber = (value: number | string | undefined) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
};

export const buildPricingOptionPrices = ({
  adultPrice,
  childPrice,
  infantPrice,
}: Pick<
  PricingOptionFormValue,
  'adultPrice' | 'childPrice' | 'infantPrice'
>): PricingOptionPriceInput[] => {
  const adult = toOptionalNumber(adultPrice);
  const child = toOptionalNumber(childPrice);
  const infant = toOptionalNumber(infantPrice);
  const prices: PricingOptionPriceInput[] =
    typeof adult === 'number' ? [{ type: 'adult', price: adult }] : [];

  if (typeof child === 'number') {
    prices.push({ type: 'child', price: child });
  }

  if (typeof infant === 'number') {
    prices.push({ type: 'infant', price: infant });
  }

  return prices;
};

export const normalizePricingOptionsForApi = (
  pricingOptions: TourFormValues['pricingOptions'],
): PricingOptionInput[] =>
  pricingOptions.map((option) => {
    const { adultPrice, childPrice, infantPrice, ...rest } = option;

    return {
      ...rest,
      prices: buildPricingOptionPrices({
        adultPrice,
        childPrice,
        infantPrice,
      }),
      _id: rest._id || nanoid(8),
      accommodationType: rest.accommodationType
        ? rest.accommodationType.trim().toLowerCase()
        : rest.accommodationType,
      domesticFlightPerPerson: toOptionalNumber(rest.domesticFlightPerPerson),
      singleSupplement: toOptionalNumber(rest.singleSupplement),
    };
  });

export const normalizeTourDetailPricingOptionsForApi = (
  pricingOptions: readonly (IPricingOption | null)[],
): PricingOptionInput[] =>
  compactList(pricingOptions).map((option) => {
    const prices = option.prices.map(({ type, price }) => ({ type, price }));

    return {
      _id: option._id || nanoid(8),
      title: option.title,
      minPersons: option.minPersons,
      maxPersons: option.maxPersons ?? undefined,
      accommodationType: option.accommodationType ?? undefined,
      domesticFlightPerPerson: option.domesticFlightPerPerson ?? undefined,
      singleSupplement: option.singleSupplement ?? undefined,
      note: option.note ?? undefined,
      prices:
        prices.length > 0
          ? prices
          : typeof option.pricePerPerson === 'number'
          ? [{ type: 'adult', price: option.pricePerPerson }]
          : [],
    };
  });
