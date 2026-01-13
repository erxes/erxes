import { useQuery } from '@apollo/client';
import { BROADCAST_CUSTOMERS_COUNT } from '../graphql/queries';

export enum CUSTOMER_RELATION_TYPE {
  TAG = 'TAG',
  BRAND = 'BRAND',
}

export const useBroadcastChooser = ({
  countTypes,
}: {
  countTypes: CUSTOMER_RELATION_TYPE[];
}) => {
  const { data, loading } = useQuery(BROADCAST_CUSTOMERS_COUNT, {
    variables: {
      types: countTypes,
    },
  });

  return {
    counts: data?.customersCount || {},
    loading,
  };
};
