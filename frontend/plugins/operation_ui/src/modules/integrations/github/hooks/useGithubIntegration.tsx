import { useQuery, useMutation } from '@apollo/client';
import { GITHUB_ISSUES_SECTION_DATA } from '../graphql/queries/githubConfigQueries';
import { GET_GITHUB_REPOSITORIES } from '../graphql/queries/githubConnectionQueries';
import { UPSERT_GITHUB_CONFIG } from '../graphql/mutations/githubConfigMutations';
import { GET_TEAMS } from '../graphql/queries/githubConfigQueries';
import { ITeam } from '../types';

export function useGithubIssuesSectionData(installationId?: number) {
  const { data, loading, refetch } = useQuery<{
    getAllGithubConfigs: {
      _id: string;
      teamId: string;
      repoName: string;
      installationId: number;
      syncMode: string;
    }[];
    getTeams: ITeam[];
  }>(GITHUB_ISSUES_SECTION_DATA, {
    variables: { installationId },
    fetchPolicy: 'network-only',
    skip: !installationId,
  });

  return { data, loading, refetch };
}

export function useGithubRepositories(installationId?: number, skip?: boolean) {
  const { data, loading } = useQuery<{
    getGithubRepositories: {
      fullName: string;
      name: string;
      isPrivate: boolean;
    }[];
  }>(GET_GITHUB_REPOSITORIES, {
    variables: { installationId },
    skip: skip || !installationId,
  });

  return { data: data?.getGithubRepositories || [], loading };
}

export function useTeams(skip?: boolean) {
  const { data, loading } = useQuery<{ getTeams: ITeam[] }>(GET_TEAMS, {
    skip,
  });
  return { data: data?.getTeams || [], loading };
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
