import { gql } from '@apollo/client';

export const GET_GITHUB_CONNECTIONS = gql`
  query operationGithubConnections {
    getGithubConnections {
      _id
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
  query operationGithubRepositories($installationId: Int!) {
    getGithubRepositories(installationId: $installationId) {
      fullName
      name
      isPrivate
    }
  }
`;
