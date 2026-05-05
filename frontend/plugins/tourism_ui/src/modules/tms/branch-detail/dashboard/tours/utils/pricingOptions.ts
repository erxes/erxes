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

export const buildPricingOptionPrices = ({
  adultPrice,
  childPrice,
  infantPrice,
}: Pick<
  PricingOptionFormValue,
  'adultPrice' | 'childPrice' | 'infantPrice'
>): PricingOptionPriceInput[] => {
  const prices: PricingOptionPriceInput[] = [
    { type: 'adult', price: adultPrice },
  ];

  if (typeof childPrice === 'number') {
    prices.push({ type: 'child', price: childPrice });
  }

  if (typeof infantPrice === 'number') {
    prices.push({ type: 'infant', price: infantPrice });
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
