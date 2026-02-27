import { useQuery, useMutation } from '@apollo/client';
import { POST_DETAIL } from '../graphql/queries/postDetailQuery';
import { POST_CMS_EDIT } from '../graphql/queries/postCmsEditQuery';
import { PostDetailResponse, PostEditVariables } from '../types';

export const usePostDetail = (postId: string) => {
  const { data, loading, error, refetch } = useQuery<PostDetailResponse>(
    POST_DETAIL,
    {
      variables: { id: postId },
      skip: !postId,
    },
  );

  const [editPost, { loading: editLoading, error: editError }] = useMutation(
    POST_CMS_EDIT,
    {
      onCompleted: () => {
        refetch();
      },
    },
  );

  const handleEditPost = async (input: PostEditVariables['input']) => {
    if (!postId) {
      throw new Error('Post ID is required for editing');
    }

    try {
      const result = await editPost({
        variables: {
          id: postId,
          input,
        },
      });
      return result.data;
    } catch (err) {
      console.error('Error editing post:', err);
      throw err;
    }
  };

  return {
    post: data?.cmsPost,
    loading,
    error,
    editLoading,
    editError,
    editPost: handleEditPost,
    refetch,
  };
};
