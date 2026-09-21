import { gql } from '@apollo/client';

export const GET_GITHUB_CONFIG_BY_TEAM = gql`
  query operationGithubConfigByTeam($teamId: String!) {
    getGithubConfigByTeam(teamId: $teamId) {
      _id
      teamId
      repoName
      installationId
      syncMode
    }
    getAllGithubConfigs {
      _id
      teamId
      repoName
      installationId
      syncMode
    }
  }
`;
