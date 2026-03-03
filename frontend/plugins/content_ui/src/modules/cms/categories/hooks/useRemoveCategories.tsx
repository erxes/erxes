import { useMutation, useApolloClient } from '@apollo/client';
import { CMS_CATEGORIES, CMS_CATEGORIES_REMOVE } from '../graphql';

export const useRemoveCategories = (
  clientPortalId: string,
  refetch: () => void,
) => {
  const client = useApolloClient();

  const [removeCategory, { loading }] = useMutation(CMS_CATEGORIES_REMOVE, {
    onCompleted: (data, clientOptions) => {
      const existingCategories = client.readQuery({
        query: CMS_CATEGORIES,
        variables: { clientPortalId, limit: 100 },
      });

      if (existingCategories && clientOptions?.variables?.id) {
        const updatedList = existingCategories.cmsCategories.list.filter(
          (cat: any) => cat._id !== (clientOptions.variables as any).id,
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

      refetch();
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
