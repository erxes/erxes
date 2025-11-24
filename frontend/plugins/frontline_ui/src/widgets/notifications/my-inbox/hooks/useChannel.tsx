import { IChannel } from '@/inbox/types/Channel';
import { gql, useQuery } from '@apollo/client';

const query = gql`
  query ChannelDetail($id: String!) {
    getChannel(_id: $id) {
      _id
      name
    }
  }
`;

export const useChannel = (id: string) => {
  const { data, loading } = useQuery<{ channelDetail: IChannel }>(query, {
    variables: { id },
  });

  const { channelDetail } = data || {};

  return {
    channelDetail,
    loading,
  };
};
