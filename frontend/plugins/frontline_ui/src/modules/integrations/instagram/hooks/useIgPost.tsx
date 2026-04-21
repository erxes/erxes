import { useQuery } from '@apollo/client';
import { GET_POST } from '../graphql/queries/igPostQueries';

interface UseIgPostProps {
  erxesApiId?: string;
}

export function useIgPost({ erxesApiId }: UseIgPostProps = {}) {
  const { data, loading } = useQuery(GET_POST, {
    variables: { erxesApiId },
    skip: !erxesApiId,
  });

  return {
    post: data?.instagramGetPost,
    loading,
  };
}
