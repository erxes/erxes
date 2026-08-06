import { gql } from '@apollo/client';

export const DISCONNECT_GITHUB = gql`
  mutation DisconnectGithub($installationId: Int!) {
    disconnectGithubConnection(installationId: $installationId) {
      success
    }
  }
`;
