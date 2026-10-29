import { gql } from '@apollo/client';

export const CORE_OAUTH_CLIENT_PANEL_DETAIL = gql`
  query coreOauthClientPanelDetail($_id: String!) {
    oauthClientAppDetail(_id: $_id) {
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
    }
  }
`;
