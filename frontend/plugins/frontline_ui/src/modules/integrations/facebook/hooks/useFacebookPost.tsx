import { useQuery } from '@apollo/client';
import { GET_POST } from '../graphql/queries/fbPostQueries';

export const useFacebookPost = ({ erxesApiId }: { erxesApiId: string }) => {
  const { data, loading, error } = useQuery(GET_POST, {
    variables: { erxesApiId },
    skip: !erxesApiId,
  });

  return {
    post: data?.facebookGetPost,
    loading,
    error,
  };
};
