import queries from '@/pos/graphql/queries';
import { useQuery } from '@apollo/client';

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
    queries.getPayments,
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
