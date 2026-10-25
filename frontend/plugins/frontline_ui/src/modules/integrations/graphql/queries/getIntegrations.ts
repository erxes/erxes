import { gql } from '~/gql';

export const INTEGRATION_INLINE = gql(`
  query IntegrationInline($_id: String!) {
    integrationDetail(_id: $_id) {
      _id
      name
      kind
      channelId
    }
  }
`);

export const GET_INTEGRATIONS_BY_KIND = gql(`
  query Integrations(
    $kind: String
    $searchValue: String
    $channelId: String!
    $cursor: String
    $cursorMode: CURSOR_MODE
    $direction: CURSOR_DIRECTION
    $limit: Int
  ) {
    integrations(
      kind: $kind
      searchValue: $searchValue
      channelId: $channelId
      cursor: $cursor
      cursorMode: $cursorMode
      direction: $direction
      limit: $limit
    ) {
      list {
        _id
        name
        kind
        isActive
        healthStatus {
          status
          error
        }
        brandId
        channelId
        facebookPage {
          pageId
          name
        }
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`);

export const GET_INTEGRATION_KINDS = gql(`
  query IntegrationsGetUsedTypes {
    integrationsGetUsedTypes {
      _id
      name
    }
  }
`);

export const GET_INTEGRATION_KINDS_BY_CHANNEL = gql(`
  query IntegrationsGetUsedTypesByChannel($channelId: String, $scope: String) {
    integrationsGetUsedTypesByChannel(channelId: $channelId, scope: $scope) {
      _id
      name
      unreadConversationCount
    }
  }
`);
