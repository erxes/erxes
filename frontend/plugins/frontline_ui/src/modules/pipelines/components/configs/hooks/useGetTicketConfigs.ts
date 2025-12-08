import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_TICKET_CONFIGS } from '../graphql';
import { TPipelineConfig } from '@/pipelines/types';
import { useParams } from 'react-router-dom';

export interface IConfig extends TPipelineConfig {
  id: string;
  updatedAt: string;
  createdAt: string;
}

interface IConfigResponse {
  ticketConfigs: IConfig[];
}

export const useGetTicketConfigs = (
  options?: QueryHookOptions<IConfigResponse>,
) => {
  const { id } = useParams<{ id: string }>();
  const effectiveChannelId = options?.variables?.channelId || id;
  const { data, loading } = useQuery<IConfigResponse>(GET_TICKET_CONFIGS, {
    ...options,
    variables: {
      channelId: effectiveChannelId,
    },
    skip: !effectiveChannelId,
  });

  return {
    ticketConfigs: data?.ticketConfigs,
    loading,
  };
};
