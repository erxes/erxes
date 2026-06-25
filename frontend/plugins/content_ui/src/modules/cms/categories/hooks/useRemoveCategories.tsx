import { useMutation, useApolloClient } from '@apollo/client';
import { CMS_CATEGORIES, CMS_CATEGORIES_REMOVE } from '../graphql';
import { ICategory } from '../types';

interface CategoriesQueryData {
  cmsCategories: {
    list: ICategory[];
  };
}

interface RemoveCategoryVariables {
  id: string;
}

export const useRemoveCategories = (
  clientPortalId: string,
  refetch?: () => void,
) => {
  const client = useApolloClient();

  const [removeCategory, { loading }] = useMutation<
    { cmsCategoriesRemove: boolean },
    RemoveCategoryVariables
  >(CMS_CATEGORIES_REMOVE, {
    onCompleted: (data, clientOptions) => {
      const existingCategories = client.readQuery<CategoriesQueryData>({
        query: CMS_CATEGORIES,
        variables: { clientPortalId, limit: 100 },
      });

      const removedCategoryId = clientOptions?.variables?.id;

      if (existingCategories && removedCategoryId) {
        const updatedList = existingCategories.cmsCategories.list.filter(
          (category) => category._id !== removedCategoryId,
        );

        client.writeQuery({
          query: CMS_CATEGORIES,
          variables: { clientPortalId, limit: 100 },
          data: {
            ...existingCategories,
            cmsCategories: {
              ...existingCategories.cmsCategories,
              list: updatedList,
            },
          },
        });
      }

      refetch?.();
    },
  });

  const removeSingleCategory = async (id: string) => {
    await removeCategory({ variables: { id } });
  };

  const removeBulkCategories = async (ids: string[]) => {
    for (const id of ids) {
      await removeCategory({ variables: { id } });
    }
  };

  return {
    removeSingleCategory,
    removeBulkCategories,
    loading,
  };
};
