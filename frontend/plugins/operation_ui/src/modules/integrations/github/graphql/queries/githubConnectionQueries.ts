import { gql } from '@apollo/client';

export const GET_GITHUB_CONNECTION = gql`
  query GithubConnection {
    getGithubConnection {
      installationId
      orgName
      orgAvatarUrl
      orgType
      isActive
      createdAt
    }
  }
`;

export const GET_GITHUB_REPOSITORIES = gql`
  query GetGithubRepositories($installationId: Int!) {
    getGithubRepositories(installationId: $installationId) {
      fullName
      name
      isPrivate
    }
  }
`;
