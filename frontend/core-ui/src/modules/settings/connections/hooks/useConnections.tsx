import { useQuery } from '@apollo/client';
import { CONNECTIONS, CONNECTIONS_TYPES } from '@/settings/connections/graphql';
import { IConnection, IConnectionType } from '@/settings/connections/types';

export const useConnections = () => {
  const { data, loading, error, refetch } = useQuery<{
    connections: IConnection[];
  }>(CONNECTIONS);

  return {
    connections: data?.connections || [],
    loading,
    error,
    refetch,
  };
};

export const useConnectionTypes = () => {
  const { data, loading, error } = useQuery<{
    connectionsTypes: IConnectionType[];
  }>(CONNECTIONS_TYPES);

  return {
    types: data?.connectionsTypes || [],
    loading,
    error,
  };
};
