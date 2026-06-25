import { useQuery, useMutation } from '@apollo/client';
import { CMS_POSTS_EDIT, POST_DETAIL } from '@/cms/posts/graphql';
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
    CMS_POSTS_EDIT,
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
