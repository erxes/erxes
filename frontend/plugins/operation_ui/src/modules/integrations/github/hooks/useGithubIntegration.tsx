import { useQuery, useMutation } from '@apollo/client';
import { GET_GITHUB_CONFIG_BY_TEAM } from '../graphql/queries/githubConfigQueries';
import { GET_GITHUB_REPOSITORIES } from '../graphql/queries/githubConnectionQueries';
import {
  DISCONNECT_GITHUB_TEAM,
  UPSERT_GITHUB_CONFIG,
} from '../graphql/mutations/githubConfigMutations';
import { IGithubConfig, IGithubRepository } from '../types';

export function useGithubConfigByTeam(teamId: string) {
  const { data, loading, error, refetch } = useQuery<{
    getGithubConfigByTeam: IGithubConfig | null;
    getAllGithubConfigs: IGithubConfig[];
  }>(GET_GITHUB_CONFIG_BY_TEAM, {
    variables: { teamId },
    fetchPolicy: 'network-only',
    skip: !teamId,
  });

  return {
    config: data?.getGithubConfigByTeam ?? undefined,
    configs: data?.getAllGithubConfigs ?? [],
    loading,
    error,
    refetch,
  };
}

export function useGithubRepositories(installationId?: number, skip?: boolean) {
  const { data, loading, error } = useQuery<{
    getGithubRepositories: IGithubRepository[];
  }>(GET_GITHUB_REPOSITORIES, {
    variables: { installationId },
    skip: skip || !installationId,
  });

  return { data: data?.getGithubRepositories || [], loading, error };
}

export function useUpsertGithubConfig(
  onCompleted: () => void,
  onError: (err: Error) => void,
) {
  const [upsertConfig, { loading: saving }] = useMutation(
    UPSERT_GITHUB_CONFIG,
    {
      onCompleted,
      onError,
    },
  );

  return { upsertConfig, saving };
}

export function useDisconnectGithubTeam(
  onCompleted: () => void,
  onError: (err: Error) => void,
) {
  const [disconnectTeam, { loading: disconnecting }] = useMutation(
    DISCONNECT_GITHUB_TEAM,
    {
      onCompleted,
      onError,
    },
  );

  return { disconnectTeam, disconnecting };
}
