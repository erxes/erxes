import { useQuery } from '@apollo/client';
import { gql } from '~/gql';

const query = gql(`
  query FrontlineNotificationChannelDetail($id: String!) {
    getChannel(_id: $id) {
      _id
      name
    }
  }
`);

export const useChannel = (id: string) => {
  const { data, loading, error } = useQuery(query, {
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
