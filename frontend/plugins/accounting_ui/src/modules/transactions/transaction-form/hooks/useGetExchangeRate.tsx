import type {
  AccountingExchangeGetRateQuery,
  AccountingExchangeGetRateQueryVariables,
} from '~/gql/graphql';
import type { QueryHookOptions } from '@apollo/client';
import { toGraphqlView } from '@/utils/graphql';
import { useQuery } from '@apollo/client';
import { EXCHANGE_GET_RATE_QUERY } from '../graphql/queries/exchangeRate';

export interface IExchangeRate {
  _id: string;
  date: Date;
  mainCurrency: string;
  rateCurrency: string;
  rate: number;
}
// exchangeGetRate(date: Date, currency: String, mainCurrency: String): ExchangeRate
export const useGetExchangeRate = (
  options?: QueryHookOptions<
    AccountingExchangeGetRateQuery,
    AccountingExchangeGetRateQueryVariables
  >,
) => {
  const {
    data: queryData,
    loading,
    error,
  } = useQuery(EXCHANGE_GET_RATE_QUERY, {
    ...options,
  });
  const data = toGraphqlView(queryData);

  const exchangeRate = data?.exchangeGetRate;
  const spotRate = exchangeRate?.rate ?? 0;
  return {
    exchangeRate,
    spotRate,
    loading,
    error,
  };
};
