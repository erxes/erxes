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

const STATIC_PAYMENTS: Payment[] = [
  {
    _id: '0sZvoDO76mQ7PtMdYZ_Sy',
    name: 'Эн Эм Эм Эй ХХК',
    kind: 'qpayQuickqr',
    status: '',
    config: {},
    createdAt: '',
  },
  {
    _id: 'wVwEpQRAmutkBZeTJEYHa',
    name: 'enkhtuvshin',
    kind: 'qpay',
    status: '',
    config: {},
    createdAt: '',
  },
  {
    _id: 'PYkAu-XZ5Iep8y5b0BYgG',
    name: 'test',
    kind: 'qpayQuickqr',
    status: '',
    config: {},
    createdAt: '',
  },
  {
    _id: 'OKy6iUk087EpS_gVgzEOt',
    name: 'Hotel test',
    kind: 'stripe',
    status: '',
    config: {},
    createdAt: '',
  },
  {
    _id: 'yCM0wNZS24r0NSMYRpxqJ',
    name: 'Nomin',
    kind: 'qpayQuickqr',
    status: '',
    config: {},
    createdAt: '',
  },
];

export const usePayments = ({ status, kind }: UsePaymentsProps = {}) => {
  const { data, loading, error, refetch } = useQuery<{ payments: Payment[] }>(
    queries.getPayments,
    {
      variables: { status, kind },
      fetchPolicy: 'cache-and-network',
    },
  );

  return {
    payments:
      data?.payments && data.payments.length > 0
        ? data.payments
        : STATIC_PAYMENTS,
    loading,
    error,
    refetch,
  };
};
