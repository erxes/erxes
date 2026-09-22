import { gql } from '@apollo/client';

export const UPSERT_GITHUB_CONFIG = gql`
  mutation operationGithubUpsertConfig(
    $teamId: String!
    $repoName: String!
    $installationId: Int!
    $syncMode: String!
  ) {
    upsertGithubConfig(
      teamId: $teamId
      repoName: $repoName
      installationId: $installationId
      syncMode: $syncMode
    ) {
      _id
      teamId
      repoName
      installationId
      syncMode
    }
  }
`;

export const DISCONNECT_GITHUB_TEAM = gql`
  mutation operationGithubDisconnectTeam($teamId: String!) {
    operationGithubDisconnectTeam(teamId: $teamId) {
      success
    }
  }
`;
