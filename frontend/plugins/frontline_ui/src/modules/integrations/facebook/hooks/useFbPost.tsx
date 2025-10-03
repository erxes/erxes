import { useQuery } from '@apollo/client';
import { GET_POST } from '../graphql/queries/fbPostQueries';

interface UseFbPostsProps {
  erxesApiId?: string;
}

export function useFbPost({ erxesApiId }: UseFbPostsProps = {}) {
  const { data, loading } = useQuery(GET_POST, {
    variables: { erxesApiId },
    skip: !erxesApiId,
  });

  return {
    post: data?.facebookGetPost,
    loading,
  };
}
