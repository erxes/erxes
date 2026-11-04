import { useQuery } from '@apollo/client';
import { useMemo } from 'react';

import { pmsQueries } from '@/pms/graphql/queries';
import type { PmsPaymentsQuery } from '~/gql/graphql';
import { compactList } from '~/utils/cursorList';

export type Payment = NonNullable<
  NonNullable<PmsPaymentsQuery['payments']>[number]
>;

export interface UsePaymentsProps {
  status?: string;
  kind?: string;
}

export const usePayments = ({ status, kind }: UsePaymentsProps = {}) => {
  const { data, loading, error, refetch } = useQuery(pmsQueries.Payments, {
    variables: { status, kind },
    fetchPolicy: 'cache-and-network',
  });

  const list = data?.payments;
  const payments = useMemo(() => compactList(list), [list]);

  return {
    payments,
    loading,
    error,
    refetch,
  };
};
