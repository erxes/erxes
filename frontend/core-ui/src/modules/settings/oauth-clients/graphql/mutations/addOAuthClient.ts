import { gql } from '@apollo/client';

const ADD_OAUTH_CLIENT = gql`
  mutation OAuthClientAppsAdd(
    $name: String!
    $logo: String
    $description: String
    $type: OAuthClientAppType!
    $accessTokenLifetime: OAuthClientAccessTokenLifetime
    $redirectUrls: [String!]
  ) {
    oauthClientAppsAdd(
      name: $name
      logo: $logo
      description: $description
      type: $type
      accessTokenLifetime: $accessTokenLifetime
      redirectUrls: $redirectUrls
    ) {
      _id
      name
      logo
      description
      clientId
      type
      accessTokenLifetime
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
