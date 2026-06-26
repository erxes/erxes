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
    await Promise.all(
      ids.map((_id) => editCategoryMutation({ variables: { _id, input } })),
    );
  };

  return { bulkEditCategories, loading };
};
