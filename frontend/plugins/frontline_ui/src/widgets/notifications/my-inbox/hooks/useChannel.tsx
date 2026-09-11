import { IChannel } from '@/inbox/types/Channel';
import { gql, useQuery } from '@apollo/client';

const query = gql`
  query FrontlineNotificationChannelDetail($id: String!) {
    getChannel(_id: $id) {
      _id
      name
    }
  }
`;

export const useChannel = (id: string) => {
  const { data, loading, error } = useQuery<{ getChannel: IChannel }>(query, {
    variables: { id },
    skip: !id,
  });

  const channelDetail = data?.getChannel;

  return {
    channelDetail,
    loading,
    error,
  };
};
