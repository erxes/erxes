import { gql } from '@apollo/client';

const ADD_OAUTH_CLIENT = gql`
  mutation OAuthClientAppsAdd(
    $name: String!
    $logo: String
    $description: String
    $type: OAuthClientAppType!
    $redirectUrls: [String!]
  ) {
    oauthClientAppsAdd(
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

export { ADD_OAUTH_CLIENT };
