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

  const currencies = toCurrencyList(data?.dealCurrencies?.value);

  const configuredMain = toCurrencyList(data?.mainCurrencyConfig?.value)[0];
  const mainCurrency = configuredMain ?? currencies[0] ?? '';

  return { currencies, mainCurrency, loading };
};
