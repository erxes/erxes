import { useMutation } from '@apollo/client';
import { POSTS_EDIT } from '../graphql/mutations/postsEditMutation';

export const useBulkEditPosts = () => {
  const [editPostMutation, { loading }] = useMutation(POSTS_EDIT);

  const bulkEditPosts = async (
    ids: string[],
    input: Record<string, unknown>,
  ) => {
    await Promise.all(ids.map((id) => editPostMutation({ variables: { id, input } })));
  };

  return { bulkEditPosts, loading };
};
