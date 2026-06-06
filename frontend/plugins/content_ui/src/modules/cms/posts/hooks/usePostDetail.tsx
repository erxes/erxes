import { toast } from 'erxes-ui';
import { useQuery, useMutation } from '@apollo/client';
import { CMS_POST } from '../../graphql/queries';
import { POST_CMS_EDIT } from '../graphql/queries/postCmsEditQuery';

export const usePostDetail = (postId?: string) => {
  const { data, loading, error, refetch } = useQuery(
    CMS_POST,
    postId ? { variables: { id: postId } } : { skip: true },
  );

  const [editPost, { loading: editLoading, error: editError }] = useMutation(
    POST_CMS_EDIT,
    {
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Post updated successfully',
          variant: 'default',
        });
        refetch();
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to update post',
          variant: 'destructive',
        });
      },
    },
  );

  const handleEditPost = async (input: any) => {
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
