import { useQuery, useMutation } from '@apollo/client';
import { GET_GITHUB_CONNECTION } from '../graphql/queries/githubConnectionQueries';
import { DISCONNECT_GITHUB } from '../graphql/mutations/githubConnectionMutations';

export function useGithubConnection() {
  const { data, loading, error, refetch } = useQuery<{
    getGithubConnection: {
      installationId: number;
      orgName: string;
      orgAvatarUrl?: string;
      orgType: string;
      createdAt: string;
      isActive: boolean;
    };
  }>(GET_GITHUB_CONNECTION, {
    fetchPolicy: 'network-only',
  });

  const [disconnectGithub, { loading: disconnecting, error: disconnectError }] =
    useMutation(DISCONNECT_GITHUB, {
      onCompleted: () => refetch(),
    });

  return {
    data,
    loading,
    error,
    refetch,
    disconnectGithub,
    disconnecting,
    disconnectError,
  };
}
