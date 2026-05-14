import { gql } from '@apollo/client';

const GET_OAUTH_CLIENTS = gql`
  query OAuthClientApps($searchValue: String, $page: Int, $perPage: Int) {
    oauthClientApps(searchValue: $searchValue, page: $page, perPage: $perPage) {
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
    }
    oauthClientAppsTotalCount(searchValue: $searchValue)
  }
`;

export { GET_OAUTH_CLIENTS };
