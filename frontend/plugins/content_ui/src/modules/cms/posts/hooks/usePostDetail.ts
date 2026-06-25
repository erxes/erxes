import { useQuery, useMutation } from '@apollo/client';
import { CMS_POSTS_EDIT, POST_DETAIL } from '@/cms/posts/graphql';
import type {
  PostDetailResponse,
  PostEditVariables,
  PostInput,
  Posts,
} from '../types';

interface PostEditResponse {
  cmsPostsEdit?: Posts | null;
}

export const usePostDetail = (postId: string) => {
  const { data, loading, error, refetch } = useQuery<PostDetailResponse>(
    POST_DETAIL,
    {
      variables: { id: postId },
      skip: !postId,
    },
  );

  const [editPost, { loading: editLoading, error: editError }] = useMutation<
    PostEditResponse,
    PostEditVariables
  >(CMS_POSTS_EDIT, {
    onCompleted: () => {
      refetch();
    },
  });

  const handleEditPost = async (input: PostInput) => {
    if (!postId) {
      throw new Error('Post ID is required for editing');
    }

    const result = await editPost({
      variables: {
        id: postId,
        input,
      },
    });

    return result.data;
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
