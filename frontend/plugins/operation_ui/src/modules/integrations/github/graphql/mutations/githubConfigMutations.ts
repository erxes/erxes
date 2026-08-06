import { gql } from '@apollo/client';

export const UPSERT_GITHUB_CONFIG = gql`
  mutation UpsertGithubConfig(
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
      syncMode
    }
  }
`;
