import { gql } from '@apollo/client';

const REMOVE_OAUTH_CLIENT = gql`
  mutation OAuthClientAppsRemove($_id: String!) {
    oauthClientAppsRemove(_id: $_id)
  }
`;

export { REMOVE_OAUTH_CLIENT };
