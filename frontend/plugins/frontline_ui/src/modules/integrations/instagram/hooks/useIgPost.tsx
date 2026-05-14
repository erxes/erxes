import { useQuery } from '@apollo/client';
import { GET_POST } from '../graphql/queries/igPostQueries';
import { IInstagramPost } from '../types/InstagramTypes';

interface UseIgPostProps {
  erxesApiId?: string;
}

export function useIgPost({ erxesApiId }: UseIgPostProps = {}) {
  const { data, loading, error } = useQuery<{
    instagramGetPost: IInstagramPost;
  }>(GET_POST, {
    variables: { erxesApiId },
    skip: !erxesApiId,
  });

  return {
    post: data?.instagramGetPost,
    loading,
    error,
  };
}
