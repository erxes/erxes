import { QueryHookOptions, useQuery } from '@apollo/client';
import { CHANNEL_DETAIL_QUERY } from '../graphql/queries/ChannelQueries';
import type {
  ChannelInlineQuery,
  ChannelInlineQueryVariables,
} from '~/gql/graphql';

export const useChannelInline = (
  options?: QueryHookOptions<ChannelInlineQuery, ChannelInlineQueryVariables>,
) => {
  const { data, loading, error } = useQuery(CHANNEL_DETAIL_QUERY, options);

  return { channelDetail: data?.getChannel ?? undefined, loading, error };
};
