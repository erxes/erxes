import { gql } from '~/gql';
import type { ObservableQuery } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';
import { CONVERSATION_REPORT_QUERIES } from '@/report/graphql/queries/getChart';

export const REMOVE_INTEGRATION = gql(`
  mutation IntegrationsRemove($id: String!) {
    integrationsRemove(_id: $id)
  }
`);

const INTEGRATION_REMOVAL_QUERY_NAMES = new Set([
  'Integrations',
  'IntegrationsGetUsedTypes',
  'IntegrationsGetUsedTypesByChannel',
  'ChannelIntegrationsPeek',
  'frontlineChannelList',
  'Conversations',
  'ConversationCounts',
  ...CONVERSATION_REPORT_QUERIES.map(getOperationName),
]);

export const shouldRefetchIntegrationRemovalQuery = (
  query: ObservableQuery<unknown>,
): boolean =>
  query.hasObservers() &&
  INTEGRATION_REMOVAL_QUERY_NAMES.has(query.queryName ?? '');
