import type {
  AccountingGetAccCurrentCostQuery,
  AccountingGetAccCurrentCostQueryVariables,
  AccountingGetAccLastIncomePriceQuery,
  AccountingGetAccLastIncomePriceQueryVariables,
  AccountingProductUnitPriceQuery,
  AccountingProductUnitPriceQueryVariables,
} from '~/gql/graphql';
import type { QueryHookOptions } from '@apollo/client';
import { toGraphqlView } from '@/utils/graphql';
import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import {
  GET_ACCOUNTING_PRODUCT_UNIT_PRICE_QUERY,
  GET_ACC_CURRENT_COST_QUERY,
  GET_ACC_LAST_INCOME_PRICE_QUERY,
} from '../graphql/queries/invCostInfo';

export type IInvCostInfo = Record<
  string,
  Omit<
    AccountingGetAccCurrentCostQuery['getAccCurrentCost'][number],
    'productId'
  >
>;

export type ILastIncomePriceInfo = Record<string, number>;

export const toInvCostMap = (
  rows: AccountingGetAccCurrentCostQuery['getAccCurrentCost'],
): IInvCostInfo =>
  Object.fromEntries(rows.map(({ productId, ...cost }) => [productId, cost]));

export const toIncomePriceMap = (
  rows: AccountingGetAccLastIncomePriceQuery['getAccLastIncomePrice'],
): ILastIncomePriceInfo =>
  Object.fromEntries(
    rows.map(({ productId, unitPrice }) => [productId, unitPrice]),
  );

export const useGetAccCurrentCost = (
  options?: QueryHookOptions<
    AccountingGetAccCurrentCostQuery,
    AccountingGetAccCurrentCostQueryVariables
  >,
) => {
  const {
    data: queryData,
    loading,
    error,
  } = useQuery(GET_ACC_CURRENT_COST_QUERY, {
    ...options,
  });
  const data = toGraphqlView(queryData);

  const currentCostInfo = useMemo(
    () => (data ? toInvCostMap(data.getAccCurrentCost) : undefined),
    [data],
  );
  return {
    currentCostInfo,
    loading,
    error,
  };
};

export const useGetAccLastIncomePrice = (
  options?: QueryHookOptions<
    AccountingGetAccLastIncomePriceQuery,
    AccountingGetAccLastIncomePriceQueryVariables
  >,
) => {
  const {
    data: queryData,
    loading,
    error,
  } = useQuery(GET_ACC_LAST_INCOME_PRICE_QUERY, {
    ...options,
  });
  const data = toGraphqlView(queryData);

  const lastIncomePriceInfo = useMemo(
    () => (data ? toIncomePriceMap(data.getAccLastIncomePrice) : undefined),
    [data],
  );
  return {
    lastIncomePriceInfo,
    loading,
    error,
  };
};

export const useGetAccountingProductUnitPrice = (
  options?: QueryHookOptions<
    AccountingProductUnitPriceQuery,
    AccountingProductUnitPriceQueryVariables
  >,
) => {
  const {
    data: queryData,
    loading,
    error,
  } = useQuery(GET_ACCOUNTING_PRODUCT_UNIT_PRICE_QUERY, {
    ...options,
  });
  const data = toGraphqlView(queryData);

  return {
    unitPrice: data?.productDetail?.unitPrice ?? 0,
    productWeight: data?.productDetail?.weight ?? 1,
    loading,
    error,
  };
};
