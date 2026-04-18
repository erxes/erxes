import { gql } from '@apollo/client';

const EDIT_OAUTH_CLIENT = gql`
  mutation OAuthClientAppsEdit(
    $_id: String!
    $name: String!
    $logo: String
    $description: String
    $type: OAuthClientAppType!
    $redirectUrls: [String!]
  ) {
    oauthClientAppsEdit(
      _id: $_id
      name: $name
      logo: $logo
      description: $description
      type: $type
      redirectUrls: $redirectUrls
    ) {
      _id
      name
      logo
      description
      clientId
      type
      redirectUrls
      status
      lastUsedAt
      createdAt
      updatedAt
      generatedSecret
    }
  }
`;

export { EDIT_OAUTH_CLIENT };
