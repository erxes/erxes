import { useQuery } from '@apollo/client';
import { GET_PAYMENTS } from '@/payments/graphql/queries';
import { isDefined } from 'erxes-ui';
import { useMemo } from 'react';
import type { PaymentsQuery } from '~/gql/graphql';

export type Payment = NonNullable<
  NonNullable<PaymentsQuery['payments']>[number]
>;

export interface UsePaymentsProps {
  status?: string;
  kind?: string;
}

export const usePayments = ({ status, kind }: UsePaymentsProps = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_PAYMENTS, {
    variables: { status, kind },
    fetchPolicy: 'cache-and-network',
  });

  const payments = useMemo(
    () => (data?.payments ?? []).filter(isDefined),
    [data?.payments],
  );

  return {
    payments,
    loading,
    error,
    refetch,
  };
};
