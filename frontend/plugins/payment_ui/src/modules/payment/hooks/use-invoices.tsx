import { OperationVariables, useQuery } from '@apollo/client';

import { useMultiQueryState } from 'erxes-ui';
import { INVOICES } from '~/modules/payment/graphql/queries';


export const useInvoicesVariables = (options?: OperationVariables) => {
  const LIMIT = 20;
  const [queries] = useMultiQueryState<{
    searchValue: string;
  }>(['searchValue']);
  return {
    ...options?.variables,
    searchValue: queries?.searchValue,
    limit: LIMIT,
    orderBy: {
      createdAt: -1,
    },
  };
};

export const useInvoices = (options?: OperationVariables) => {
  const variables = useInvoicesVariables(options);
  const { data, error, loading } = useQuery(INVOICES, {
    variables,
    ...options,
  });
  const invoices = data?.invoices?.list || [];
  const totalCount = data?.invoices?.totalCount || 0;
  const pageInfo = data?.invoices?.pageInfo || undefined;

  return {
    invoices,
    totalCount,
    pageInfo,
    error,
    loading,
  };
};
