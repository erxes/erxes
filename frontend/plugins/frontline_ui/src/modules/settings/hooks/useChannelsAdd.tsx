import { ApolloCache, MutationHookOptions, useMutation } from '@apollo/client';
import React from 'react';
import { TChannel, TChannelForm } from '../types/channel';
import { useToast } from 'erxes-ui';
import { ADD_CHANNELS, GET_CHANNELS } from '../graphql';

interface ChannelData {
  channels: TChannel[];
  channelsTotalCount: number;
}
type AddChannelResult = {
  channelsAdd: TChannelForm;
};

export function useChannelsAdd(
  options?: MutationHookOptions<AddChannelResult, any>,
) {
  const [channelsAdd, { loading, error }] = useMutation(ADD_CHANNELS, {
    ...options,
    update: (cache: ApolloCache<any>, { data }) => {
      try {
        const existingData = cache.readQuery<ChannelData>({
          query: GET_CHANNELS,
        });
        if (!existingData || !existingData.channels || !data?.channelsAdd)
          return;

        cache.writeQuery<ChannelData>({
          query: GET_CHANNELS,
          data: {
            channels: [data.channelsAdd, ...existingData.channels],
            channelsTotalCount: existingData.channelsTotalCount + 1,
          },
        });
      } catch (e) {
        console.log('error', e);
      }
    },
  });

  return {
    channelsAdd,
    loading,
    error,
  };
}
