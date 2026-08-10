import { useQuery, OperationVariables } from '@apollo/client';
import {
  GET_ACCOUNTING_PRODUCT_UNIT_PRICE_QUERY,
  GET_ACC_CURRENT_COST_QUERY,
  GET_ACC_LAST_INCOME_PRICE_QUERY,
} from '../graphql/queries/invCostInfo';

export interface IInvCostInfo {
  [productId: string]: {
    unitCost: number;
    remainder: number;
    totalCost: number;
  };
}

export type ILastIncomePriceInfo = Record<string, number>;

type TProductUnitPriceResponse = {
  productDetail?: {
    _id: string;
    unitPrice?: number | null;
  } | null;
};

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

export const useGetAccLastIncomePrice = (options?: OperationVariables) => {
  const { data, loading, error } = useQuery<
    { getAccLastIncomePrice: ILastIncomePriceInfo },
    OperationVariables
  >(GET_ACC_LAST_INCOME_PRICE_QUERY, {
    ...options,
  });

  return {
    lastIncomePriceInfo: data?.getAccLastIncomePrice,
    loading,
    error,
  };
};

export const useGetAccountingProductUnitPrice = (
  options?: OperationVariables,
) => {
  const { data, loading, error } = useQuery<
    TProductUnitPriceResponse,
    OperationVariables
  >(GET_ACCOUNTING_PRODUCT_UNIT_PRICE_QUERY, {
    ...options,
  });

  return {
    unitPrice: data?.productDetail?.unitPrice ?? 0,
    loading,
    error,
  };
};
