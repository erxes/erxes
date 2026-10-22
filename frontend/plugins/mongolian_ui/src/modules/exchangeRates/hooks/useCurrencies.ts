import { useQuery } from '@apollo/client';
import { queries } from '../graphql';

const toCurrencyList = (config: unknown): string[] => {
  const value =
    config && typeof config === 'object' && 'value' in config
      ? config.value
      : undefined;

  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }
  return typeof value === 'string' && value ? [value] : [];
};

export const useCurrencies = () => {
  const { data, loading } = useQuery(queries.currencyConfig, {
    fetchPolicy: 'cache-first',
  });

  const currencies = toCurrencyList(data?.dealCurrencies);

  const configuredMain = toCurrencyList(data?.mainCurrencyConfig)[0];
  const mainCurrency = configuredMain ?? currencies[0] ?? '';

  return { currencies, mainCurrency, loading };
};
