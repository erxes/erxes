import { useMutation } from '@apollo/client';
import { syncCategoriesMutation } from '../graphql/mutations/syncCategriesMutations';
import { useToast } from 'erxes-ui';
import { CategoryItem, CategoryStatus } from '../types/categoryItem';

export const useSyncCategory = () => {
  const [mutate, { loading, error }] = useMutation(syncCategoriesMutation);
  const { toast } = useToast();

  const syncCategories = async (
    toCheckCategories: CategoryItem[],
    selectedFilter: CategoryStatus,
  ): Promise<CategoryItem[] | undefined> => {
    if (!toCheckCategories || toCheckCategories.length === 0) {
      toast({
        title: 'Error',
        description: 'Sync categories not found',
        variant: 'destructive',
      });
      return;
    }

    const categoriesToSync = toCheckCategories.filter(
      (item) => item.status === selectedFilter && !item.isSynced,
    );

    if (categoriesToSync.length === 0) {
      toast({
        title: 'Info',
        description: `All ${selectedFilter} categories are already synced`,
      });
      return toCheckCategories;
    }

    try {
      const action = selectedFilter.toUpperCase();

      const response = await mutate({
        variables: {
          action,
          categories: categoriesToSync.map((item) => ({
            id: item._id || item.id,
            code: item.code,
            name: item.name,
            parent: item.parent,
            is_citytax: item.is_citytax || false,
            is_raw: item.is_raw || false,
            citytax_row: item.citytax_row,
            is_service: item.is_service || false,
            is_sellable: item.is_sellable !== false,
            order: item.order || '0!',
            parent_code: item.parent_code,
          })),
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        },
      });

      if (response.data?.toSyncCategories) {
        const updatedCategories = toCheckCategories.map((item) => {
          const wasSynced = categoriesToSync.some(
            (syncedItem) =>
              (syncedItem._id && syncedItem._id === item._id) ||
              (syncedItem.id && syncedItem.id === item.id),
          );

          if (wasSynced && item.status === selectedFilter) {
            return { ...item, isSynced: true };
          }
          return item;
        });

        toast({
          title: 'Success',
          description: `${categoriesToSync.length} ${selectedFilter} categories synced`,
        });

        return updatedCategories;
      }
    } catch (err) {
      console.error('Sync categories error:', err);
      toast({
        title: 'Error',
        description: 'Sync categories error',
        variant: 'destructive',
      });
    }
  };

  return {
    syncCategories,
    loading,
    error,
  };
};
