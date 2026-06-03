import { useQuery } from '@apollo/client';
import { queries } from '../graphql';
import { CurrenciesQueryResponse } from '../types';

const DEAL_CURRENCY_CODE = 'dealCurrency';

export const useCurrencies = () => {
  const { data, loading } = useQuery<CurrenciesQueryResponse>(queries.configs, {
    variables: { code: DEAL_CURRENCY_CODE },
    fetchPolicy: 'cache-first',
  });

  const currencies = data?.configsGetValue?.value ?? [];

  return { currencies, loading };
};
