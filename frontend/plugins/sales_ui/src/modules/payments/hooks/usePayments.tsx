import { useQuery } from '@apollo/client';
import { GET_PAYMENTS } from '@/payments/graphql/queries';

export interface Payment {
  _id: string;
  name: string;
  kind: string;
  status: string;
  config: any;
  createdAt: string;
}

export interface UsePaymentsProps {
  status?: string;
  kind?: string;
}

export const usePayments = ({ status, kind }: UsePaymentsProps = {}) => {
  const { data, loading, error, refetch } = useQuery<{ payments: Payment[] }>(
    GET_PAYMENTS,
    {
      variables: { status, kind },
      fetchPolicy: 'cache-and-network',
    },
  );

  return {
    payments: data?.payments || [],
    loading,
    error,
    refetch,
  };
};
