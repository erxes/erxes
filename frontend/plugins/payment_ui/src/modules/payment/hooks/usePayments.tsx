import { OperationVariables, useQuery } from '@apollo/client';

import { PAYMENTS } from '~/modules/payment/graphql/queries';

export const usePayments = (options?: OperationVariables) => {
  const { data, error, loading } = useQuery(PAYMENTS, {
    ...options,
  });

  const payments = data?.payments || [];
  const totalCount = data?.payments?.length || 0;

  return {
    payments,
    totalCount,
    error,
    loading,
  };
};
