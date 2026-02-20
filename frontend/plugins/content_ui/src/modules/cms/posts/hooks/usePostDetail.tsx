import { useQuery } from '@apollo/client';
import { POST_DETAIL } from '../graphql/queries/postDetailQuery';

export const usePostDetail = (postId?: string) => {
  const { data, loading, error } = useQuery(
    POST_DETAIL,
    postId ? { variables: { id: postId } } : { skip: true },
  );

  return {
    post: data?.cmsPost,
    loading,
    error,
  };
};
