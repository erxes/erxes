import { nanoid } from 'nanoid';

import type { TourFormValues } from '../constants/formSchema';
import type { IPricingOption } from '../hooks/useTourDetail';

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

type WithTypename = {
  __typename?: string;
};

type PricingOptionPriceSource = PricingOptionPriceInput & WithTypename;

type PricingOptionSource = Omit<IPricingOption, 'prices'> &
  WithTypename & {
    prices?: PricingOptionPriceSource[];
  };

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
  pricingOptions: PricingOptionSource[],
): PricingOptionInput[] =>
  pricingOptions.map((option) => {
    const {
      __typename: _typename,
      pricePerPerson,
      prices = [],
      ...rest
    } = option;

    const normalizedPrices = prices.map(
      ({ __typename: _priceTypename, type, price }) => ({
        type,
        price,
      }),
    );

    return {
      ...rest,
      _id: rest._id || nanoid(8),
      prices:
        normalizedPrices.length > 0
          ? normalizedPrices
          : typeof pricePerPerson === 'number'
          ? [{ type: 'adult', price: pricePerPerson }]
          : [],
    };
  });
