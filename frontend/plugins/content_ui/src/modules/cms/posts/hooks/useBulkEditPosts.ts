import { useMutation } from '@apollo/client';
import { POSTS_EDIT } from '../graphql/mutations/postsEditMutation';

export const useBulkEditPosts = () => {
  const [editPostMutation, { loading }] = useMutation(POSTS_EDIT, {
    refetchQueries: ['CmsPostList'],
  });

  const bulkEditPosts = async (
    ids: string[],
    input: Record<string, unknown>,
  ) => {
    const results = await Promise.allSettled(
      ids.map((id) => editPostMutation({ variables: { id, input } })),
    );
    const rejected = results.filter(
      (r): r is PromiseRejectedResult => r.status === 'rejected',
    );
    if (rejected.length) throw rejected[0].reason;
  };

  return { bulkEditPosts, loading };
};
