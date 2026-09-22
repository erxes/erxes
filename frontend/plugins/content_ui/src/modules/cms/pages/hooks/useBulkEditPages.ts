import { useMutation } from '@apollo/client';
import { PAGES_EDIT } from '../graphql/mutations/pagesMutations';

export const useBulkEditPages = () => {
  const [editPageMutation, { loading }] = useMutation(PAGES_EDIT, {
    refetchQueries: ['PageList'],
  });

  const bulkEditPages = async (
    ids: string[],
    input: Record<string, unknown>,
  ) => {
    const results = await Promise.allSettled(
      ids.map((_id) => editPageMutation({ variables: { _id, input } })),
    );
    const rejected = results.filter(
      (r): r is PromiseRejectedResult => r.status === 'rejected',
    );
    if (rejected.length) throw rejected[0].reason;
  };

  return { bulkEditPages, loading };
};
