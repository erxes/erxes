import { QueryHookOptions, useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { GET_TICKET_CONFIGS } from '../graphql';
import { useParams } from 'react-router-dom';
import { compactList } from '@/shared/utils/cursorList';
import type {
  TicketConfigsQuery,
  TicketConfigsQueryVariables,
} from '~/gql/graphql';

export type IConfig = NonNullable<
  NonNullable<TicketConfigsQuery['ticketConfigs']>[number]
>;

export const useGetTicketConfigs = (
  options?: QueryHookOptions<TicketConfigsQuery, TicketConfigsQueryVariables>,
) => {
  const { id } = useParams<{ id: string }>();
  const effectiveChannelId = options?.variables?.channelId || id;
  const { data, loading, error } = useQuery(GET_TICKET_CONFIGS, {
    ...options,
    variables: effectiveChannelId
      ? { channelId: effectiveChannelId }
      : undefined,
    skip: !effectiveChannelId,
  });

  const ticketConfigs = useMemo(
    () => (data?.ticketConfigs ? compactList(data.ticketConfigs) : undefined),
    [data?.ticketConfigs],
  );

  return {
    ticketConfigs,
    loading,
    error,
  };
};
