import { gql } from '@apollo/client';
import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_CURSOR_PARAMS,
  GQL_PAGE_INFO,
} from 'erxes-ui';

export const getIntegrations = gql`
  query integrationsGetUsedTypes($limit: Int, $only: String) {
    integrationsGetUsedTypes {
      _id
      name
    }
    conversationCounts(limit: $limit, only: $only)
  }
`;

export const INTEGRATION_INLINE = gql`
  query IntegrationInline($_id: String!) {
    integrationDetail(_id: $_id) {
      _id
      kind
    }
  }
`;

export const GET_INTEGRATIONS_BY_KIND = gql`
  query Integrations($kind: String, $searchValue: String, $channelId: String!, ${GQL_CURSOR_PARAM_DEFS}) {
    integrations(kind: $kind, searchValue: $searchValue, channelId: $channelId, ${GQL_CURSOR_PARAMS}) {
      list {
        _id
        name
        kind
        isActive
        healthStatus
      }
      ${GQL_PAGE_INFO}
    }
  }
`;

export const GET_INTEGRATION_KINDS = gql`
  query IntegrationsGetUsedTypes {
    integrationsGetUsedTypes {
      _id
      name
    }
  }
`;
