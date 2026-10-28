import { useQuery } from '@apollo/client';
import { useCallback } from 'react';

import { AGENTS_CONNECTIONS } from '../graphql/connection';
import type {
  IAgentsConnectionEntry,
  IAgentsConnectionsData,
} from '../graphql/connection';

export interface IUseAgentsConnectionResult {
  connections: IAgentsConnectionEntry[];
  loading: boolean;
  error: string | undefined;
  refetch: () => Promise<void>;
}

/**
 * The connection an unselected chat turn runs on: the entry the server marks
 * `isDefault`, else the first saved one (older responses, same fallback as
 * the backend).
 */
export const findDefaultAgentsConnection = <
  T extends { isDefault?: boolean | null },
>(
  connections: readonly T[],
): T | undefined =>
  connections.find((connection) => connection.isDefault) ?? connections[0];

/**
 * Loads the acting user's configured BYOK connections (one entry per
 * provider). The backend never returns the stored API keys; `hasKey` only
 * reports whether one is stored.
 */
export const useAgentsConnection = (): IUseAgentsConnectionResult => {
  const { data, loading, error, refetch } =
    useQuery<IAgentsConnectionsData>(AGENTS_CONNECTIONS);

  const handleRefetch = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    connections: data?.agentsConnections ?? [],
    loading,
    error: error?.message,
    refetch: handleRefetch,
  };
};
