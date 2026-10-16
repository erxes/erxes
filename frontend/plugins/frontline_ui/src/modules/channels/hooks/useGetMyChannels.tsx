import { useQuery, QueryHookOptions } from '@apollo/client';
import { useMemo } from 'react';
import { GET_MY_CHANNELS } from '@/channels/graphql';
import { compactList } from '@/shared/utils/cursorList';
import type {
  GetMyChannelsQuery,
  GetMyChannelsQueryVariables,
} from '~/gql/graphql';

/**
 * Every consumer asks for the same order so they render consistently and share
 * one Apollo cache entry. The API collates names case-insensitively, so this is
 * the order the sidebar used to produce with `localeCompare`.
 */
const MY_CHANNELS_ORDER = { sortField: 'name', sortDirection: 1 };

export const useGetMyChannels = (
  options?: QueryHookOptions<GetMyChannelsQuery, GetMyChannelsQueryVariables>,
) => {
  const { data, loading, refetch } = useQuery(GET_MY_CHANNELS, {
    fetchPolicy: 'cache-and-network',
    ...options,
    variables: { ...MY_CHANNELS_ORDER, ...options?.variables },
  });

  const channels = useMemo(
    () => (data?.getMyChannels ? compactList(data.getMyChannels) : undefined),
    [data?.getMyChannels],
  );

  return { channels, loading, refetch };
};
