import { useQuery } from '@apollo/client';
import {
  GET_INTEGRATION_KINDS,
  GET_INTEGRATION_KINDS_BY_CHANNEL,
} from '../graphql/queries/getIntegrations';
import { ChannelScope } from '@/channels/types';
import { compactList } from '@/shared/utils/cursorList';

export const useUsedIntegrationTypes = () => {
  const { data, loading } = useQuery(GET_INTEGRATION_KINDS);

  return {
    integrationTypes: compactList(data?.integrationsGetUsedTypes),
    loading,
  };
};

/**
 * Integration types in use by the channels this user can see, narrowed to one
 * channel, to a channel scope, or both. Skip it until the answer is needed —
 * the inbox navigation asks per channel, as each channel is expanded.
 */
export const useUsedIntegrationTypesByChannel = ({
  channelId,
  scope,
  skip,
}: {
  channelId?: string;
  scope?: ChannelScope;
  skip?: boolean;
}) => {
  const { data, loading } = useQuery(GET_INTEGRATION_KINDS_BY_CHANNEL, {
    variables: { channelId, scope },
    skip,
    fetchPolicy: 'cache-and-network',
  });

  return {
    integrationTypes: compactList(data?.integrationsGetUsedTypesByChannel),
    loading,
  };
};
