import { useQuery } from '@apollo/client';
import { CURRENCY_RATE_CURRENCIES } from '../graphql';
import { ICurrencyConfigResponse } from '../types';

const toList = (value?: string[] | string): string[] => {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
};

export const useCurrencyRateCurrencies = () => {
  const { data, loading } = useQuery<ICurrencyConfigResponse>(
    CURRENCY_RATE_CURRENCIES,
  );

  const mainCurrency = toList(data?.mainCurrency?.value)[0] || '';
  // the main currency is always 1, so it never gets a rate of its own
  const rateCurrencies = toList(data?.dealCurrency?.value).filter(
    (currency) => currency !== mainCurrency,
  );

  return { mainCurrency, rateCurrencies, loading };
};
