import { useQuery, OperationVariables } from '@apollo/client';
import { EXCHANGE_GET_RATE_QUERY } from '../graphql/queries/exchangeRate';

export interface IExchangeRate {
  _id: string
  date: Date
  mainCurrency: string
  rateCurrency: string
  rate: number
}
// exchangeGetRate(date: Date, currency: String, mainCurrency: String): ExchangeRate
export const useGetExchangeRate = (options?: OperationVariables) => {
  const { data, loading, error } = useQuery<
    { exchangeGetRate: IExchangeRate },
    OperationVariables
  >(EXCHANGE_GET_RATE_QUERY, {
    ...options,
  });

  const exchangeRate = data?.exchangeGetRate;
  const spotRate = exchangeRate?.rate ?? 0;
  return {
    exchangeRate,
    spotRate,
    loading,
    error,
  };
};
