import { useCallback } from 'react';
import { useQuery } from '@apollo/client';
import { GET_GITHUB_CONNECTIONS } from '../graphql/queries/githubConnectionQueries';
import { compactList } from '@/operation/utils/cursorList';

const INSTALL_REFRESH_ATTEMPTS = 10;
const INSTALL_REFRESH_DELAY_MS = 1000;

const waitForInstallWebhook = () =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, INSTALL_REFRESH_DELAY_MS);
  });

export function useGithubConnection() {
  const { data, loading, error, refetch } = useQuery(GET_GITHUB_CONNECTIONS, {
    fetchPolicy: 'network-only',
  });

  const refetchUntilNewConnection = useCallback(
    async (knownInstallationIds: readonly number[]) => {
      const knownInstallations = new Set(knownInstallationIds);
      let connections = compactList(data?.getGithubConnections);

      for (let attempt = 0; attempt < INSTALL_REFRESH_ATTEMPTS; attempt += 1) {
        const result = await refetch();
        connections = compactList(result.data?.getGithubConnections);

        if (
          connections.some(
            (connection) => !knownInstallations.has(connection.installationId),
          )
        ) {
          return { connections, added: true };
        }

        if (attempt < INSTALL_REFRESH_ATTEMPTS - 1) {
          await waitForInstallWebhook();
        }
      }

      return { connections, added: false };
    },
    [refetch, data],
  );

  return {
    data,
    loading,
    error,
    refetch,
    refetchUntilNewConnection,
  };
}
