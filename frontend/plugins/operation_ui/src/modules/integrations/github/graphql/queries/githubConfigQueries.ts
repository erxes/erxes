import { gql } from '@apollo/client';

export const GET_TEAMS = gql`
  query getTeams {
    getTeams {
      _id
      name
    }
  }
`;

export const GITHUB_ISSUES_SECTION_DATA = gql`
  query GithubIssuesSectionData($installationId: Int!) {
    getAllGithubConfigs(installationId: $installationId) {
      _id
      teamId
      repoName
      installationId
      syncMode
    }
    getTeams {
      _id
      name
    }
  }
`;
