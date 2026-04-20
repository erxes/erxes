import { gql } from '@apollo/client';

const REVOKE_OAUTH_CLIENT = gql`
  mutation OAuthClientAppsRevoke($_id: String!) {
    oauthClientAppsRevoke(_id: $_id) {
      _id
      clientId
      status
      updatedAt
    }
  }
`;

export { REVOKE_OAUTH_CLIENT };
