import { useMutation } from '@apollo/client';
import { CMS_CATEGORIES_EDIT } from '../graphql/mutations/categoriesEditMutation';

export const useBulkEditCategories = () => {
  const [editCategoryMutation, { loading }] = useMutation(CMS_CATEGORIES_EDIT, {
    refetchQueries: ['CategoryList'],
  });

  const bulkEditCategories = async (
    ids: string[],
    input: Record<string, unknown>,
  ) => {
    const results = await Promise.allSettled(
      ids.map((_id) => editCategoryMutation({ variables: { _id, input } })),
    );
    const rejected = results.filter(
      (r): r is PromiseRejectedResult => r.status === 'rejected',
    );
    if (rejected.length) throw rejected[0].reason;
  };

  return { bulkEditCategories, loading };
};
