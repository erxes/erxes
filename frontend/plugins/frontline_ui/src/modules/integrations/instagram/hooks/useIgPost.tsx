import { useQuery } from '@apollo/client';
import { GET_POST } from '../graphql/queries/igPostQueries';

interface UseIgPostProps {
  erxesApiId?: string;
}

export function useIgPost({ erxesApiId }: UseIgPostProps = {}) {
  const { data, loading, error } = useQuery(GET_POST, {
    variables: erxesApiId ? { erxesApiId } : undefined,
    skip: !erxesApiId,
  });

  return {
    post: data?.instagramGetPost,
    loading,
    error,
  };
}
