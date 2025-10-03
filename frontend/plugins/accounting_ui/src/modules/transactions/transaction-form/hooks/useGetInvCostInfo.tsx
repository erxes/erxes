import { useQuery, OperationVariables } from '@apollo/client';
import { GET_ACC_CURRENT_COST_QUERY } from '../graphql/queries/invCostInfo';

export interface IInvCostInfo {
  [productId: string]: {
    unitCost: number;
    remainder: number;
    totalCost: number;
  }
}
// getAccCurrentCost(date: Date, currency: String, mainCurrency: String): ExchangeRate
export const useGetAccCurrentCost = (options?: OperationVariables) => {
  const { data, loading, error } = useQuery<
    { getAccCurrentCost: IInvCostInfo },
    OperationVariables
  >(GET_ACC_CURRENT_COST_QUERY, {
    ...options,
  });

  const currentCostInfo = data?.getAccCurrentCost;
  return {
    currentCostInfo,
    loading,
    error,
  };
};
