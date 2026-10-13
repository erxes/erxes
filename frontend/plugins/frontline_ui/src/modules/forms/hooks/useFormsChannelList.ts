import { useQuery } from '@apollo/client';
import { GET_FORMS_CHANNEL_LIST } from '@/forms/graphql/formQueries';
import { IChannel } from '@/channels/types';

export type IFormsChannel = Pick<
  IChannel,
  '_id' | 'name' | 'icon' | 'scope' | 'formCount'
>;

interface IFormsChannelListResponse {
  getMyChannels: IFormsChannel[];
}

export const useFormsChannelList = (name?: string) => {
  const { data, loading } = useQuery<IFormsChannelListResponse>(
    GET_FORMS_CHANNEL_LIST,
    {
      variables: { name, sortField: 'name', sortDirection: 1 },
      fetchPolicy: 'cache-and-network',
    },
  );

  return { channels: data?.getMyChannels, loading };
};
