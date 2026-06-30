import { useMutation } from '@apollo/client';
import { CMS_TAGS_EDIT } from '../graphql/mutations';

export const useBulkEditTags = () => {
  const [editTagMutation, { loading }] = useMutation(CMS_TAGS_EDIT, {
    refetchQueries: ['CmsTags'],
  });

  const bulkEditTags = async (
    ids: string[],
    input: Record<string, unknown>,
  ) => {
    const results = await Promise.allSettled(
      ids.map((_id) => editTagMutation({ variables: { _id, input } })),
    );
    const rejected = results.filter(
      (r): r is PromiseRejectedResult => r.status === 'rejected',
    );
    if (rejected.length) throw rejected[0].reason;
  };

  return { bulkEditTags, loading };
};
