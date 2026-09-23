import { MOVE_CHANNEL_RESOURCES } from '@/channels/graphql';
import {
  ChannelResourceType,
  IChannelMoveResourcesResult,
} from '@/channels/types';
import { MutationHookOptions, useMutation } from '@apollo/client';

export interface IChannelMoveResourcesVariables {
  resourceType: ChannelResourceType;
  resourceIds: string[];
  sourceChannelId: string;
  targetChannelId: string;
}

interface IChannelMoveResourcesResponse {
  channelMoveResources: IChannelMoveResourcesResult;
}

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
  ],
  [ChannelResourceType.PIPELINE]: ['GetTicketPipelines'],
  [ChannelResourceType.FORM]: ['Forms', 'FormsTotalCount'],
  [ChannelResourceType.SURVEY]: ['surveyList', 'surveyTotalCount'],
  [ChannelResourceType.RESPONSE_TEMPLATE]: ['ResponseTemplates'],
};

export const useChannelMoveResources = (resourceType: ChannelResourceType) => {
  const [mutate, { loading }] = useMutation<
    IChannelMoveResourcesResponse,
    IChannelMoveResourcesVariables
  >(MOVE_CHANNEL_RESOURCES);

  const moveResources = (
    options: MutationHookOptions<
      IChannelMoveResourcesResponse,
      IChannelMoveResourcesVariables
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
