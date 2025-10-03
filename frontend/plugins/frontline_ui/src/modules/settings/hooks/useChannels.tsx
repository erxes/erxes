import { OperationVariables, useQuery } from '@apollo/client';
import { GET_CHANNEL_DETAIL_BY_ID, GET_CHANNELS } from '../graphql';

export const useChannels = (options?: OperationVariables) => {
  const { data, loading, error } = useQuery(GET_CHANNELS, options);
  const channels = data?.channels || [];
  const totalCount = data?.channelsTotalCount || undefined;
  return {
    channels,
    totalCount,
    error,
    loading,
  };
};

export function useChannelById(options?: OperationVariables) {
  const { data, loading, error } = useQuery(GET_CHANNEL_DETAIL_BY_ID, {
    ...options,
    skip: !options?.variables.id,
  });
  const channel = data?.channelDetail || {};
  return {
    channel,
    error,
    loading,
  };
}
