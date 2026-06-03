import { useQuery } from '@apollo/client';
import { queries } from '../graphql';
import { CurrencyConfigResponse } from '../types';

const toCurrencyList = (value?: string | string[]): string[] => {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
};

export const useCurrencies = () => {
  const { data, loading } = useQuery<CurrencyConfigResponse>(
    queries.currencyConfig,
    {
      fetchPolicy: 'cache-first',
    },
  );

  // Both currency fields are sourced from the "mainCurrency" config.
  // It is usually a single code, so normalise it to a list for the
  // <Select> options (guarding against unexpected shapes).
  const currencies = toCurrencyList(data?.configsGetValue?.value);
  const mainCurrency = currencies[0] ?? '';

  return { currencies, mainCurrency, loading };
};
