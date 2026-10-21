import { MOVE_CHANNEL_RESOURCES } from '@/channels/graphql';
import { ChannelResourceType } from '@/channels/types';
import { MutationHookOptions, useMutation } from '@apollo/client';
import type {
  ChannelMoveResourcesMutation,
  ChannelMoveResourcesMutationVariables,
} from '~/gql/graphql';

const CHANNEL_COUNT_QUERIES = [
  'frontlineChannelList',
  'GetChannel',
  'GetMyChannels',
];

export const CHANNEL_RESOURCE_LIST_QUERIES: Record<
  ChannelResourceType,
  string[]
> = {
  [ChannelResourceType.INTEGRATION]: [
    'Integrations',
    'IntegrationsGetUsedTypes',
    'IntegrationsGetUsedTypesByChannel',
    'ChannelIntegrationsPeek',
  ],
  [ChannelResourceType.PIPELINE]: ['GetTicketPipelines'],
  [ChannelResourceType.FORM]: ['Forms', 'FormsTotalCount'],
  [ChannelResourceType.SURVEY]: ['surveyList', 'surveyTotalCount'],
  [ChannelResourceType.RESPONSE_TEMPLATE]: ['ResponseTemplates'],
};

export const useChannelMoveResources = (resourceType: ChannelResourceType) => {
  const [mutate, { loading }] = useMutation(MOVE_CHANNEL_RESOURCES);

  const moveResources = (
    options: MutationHookOptions<
      ChannelMoveResourcesMutation,
      ChannelMoveResourcesMutationVariables
    >,
  ) =>
    mutate({
      ...options,
      refetchQueries: [
        ...CHANNEL_RESOURCE_LIST_QUERIES[resourceType],
        ...CHANNEL_COUNT_QUERIES,
      ],
      awaitRefetchQueries: true,
    });

  return { moveResources, loading };
};
