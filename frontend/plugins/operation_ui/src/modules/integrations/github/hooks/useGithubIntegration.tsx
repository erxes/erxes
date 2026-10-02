import { useQuery, useMutation } from '@apollo/client';
import { GET_GITHUB_CONFIG_BY_TEAM } from '../graphql/queries/githubConfigQueries';
import { GET_GITHUB_REPOSITORIES } from '../graphql/queries/githubConnectionQueries';
import { compactList } from '@/operation/utils/cursorList';
import {
  DISCONNECT_GITHUB_TEAM,
  UPSERT_GITHUB_CONFIG,
} from '../graphql/mutations/githubConfigMutations';

export function useGithubConfigByTeam(teamId: string) {
  const { data, loading, error, refetch } = useQuery(
    GET_GITHUB_CONFIG_BY_TEAM,
    {
      variables: { teamId },
      fetchPolicy: 'network-only',
      skip: !teamId,
    },
  );

  return {
    config: data?.getGithubConfigByTeam,
    configs: data?.getAllGithubConfigs ?? [],
    loading,
    error,
    refetch,
  };
}

export function useGithubRepositories(
  installationId: number | undefined,
  skip?: boolean,
) {
  const { data, loading, error } = useQuery(GET_GITHUB_REPOSITORIES, {
    variables:
      installationId != null ? { installationId } : undefined,
    skip: skip || !installationId,
  });

  return {
    data: compactList(data?.getGithubRepositories),
    loading,
    error,
  };
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
