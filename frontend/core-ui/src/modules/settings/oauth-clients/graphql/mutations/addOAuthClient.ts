import { gql } from '@apollo/client';

const ADD_OAUTH_CLIENT = gql`
  mutation OAuthClientAppsAdd(
    $name: String!
    $logo: String
    $description: String
    $type: OAuthClientAppType!
    $accessTokenLifetime: OAuthClientAccessTokenLifetime
    $redirectUrls: [String!]
    $allowedPublicOperationIds: [String!]
  ) {
    oauthClientAppsAdd(
      name: $name
      logo: $logo
      description: $description
      type: $type
      accessTokenLifetime: $accessTokenLifetime
      redirectUrls: $redirectUrls
      allowedPublicOperationIds: $allowedPublicOperationIds
    ) {
      _id
      name
      logo
      description
      clientId
      type
      accessTokenLifetime
      redirectUrls
      allowedPublicOperationIds
      status
      lastUsedAt
      createdAt
      updatedAt
      generatedSecret
    }
  }
`;

export { ADD_OAUTH_CLIENT };
