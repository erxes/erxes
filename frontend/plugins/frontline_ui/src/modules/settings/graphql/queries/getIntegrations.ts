import { gql } from '@apollo/client';
import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_CURSOR_PARAMS,
  GQL_PAGE_INFO,
} from 'erxes-ui';

export const GET_INTEGRATIONS_COUNTS = gql`
  query totalIntegrationsCount {
    integrationsTotalCount {
      total
      byKind
      __typename
    }
  }
`;

export const GET_INTEGRATIONS_COUNT_BY_KIND = gql`
  query IntegrationsTotalCount($kind: String) {
    integrationsTotalCount(kind: $kind) {
      total
    }
  }
`;

export const GET_INTEGRATIONS_BY_KIND = gql`
  query Integrations($kind: String, $searchValue: String,$channelId: String!, ${GQL_CURSOR_PARAM_DEFS}) {
    integrations(kind: $kind, searchValue: $searchValue, channelId: $channelId,${GQL_CURSOR_PARAMS}) {
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
