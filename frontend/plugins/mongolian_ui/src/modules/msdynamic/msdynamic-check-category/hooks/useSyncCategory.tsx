import { gql, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';

import { mutations } from '../../graphql';
import {
  InventoryCategoryAction,
  InventoryCategoryItems,
} from '../types/inventoryCategory';
import { CategoryFilterType } from '../types/inventoryCategory';

interface SyncCategoryMutationResponse {
  toSyncMsdProductCategories: { status: string };
}

const getAction = (filter: CategoryFilterType): InventoryCategoryAction => {
  switch (filter) {
    case 'create':
      return 'CREATE';
    case 'update':
      return 'UPDATE';
    case 'delete':
      return 'DELETE';
  }
};

export const useSyncCategory = () => {
  const [mutate, { loading, error }] =
    useMutation<SyncCategoryMutationResponse>(gql(mutations.toSyncCategories));
  const { toast } = useToast();

  const syncCategories = async (
    items: InventoryCategoryItems,
    selectedFilter: CategoryFilterType,
    brandId: string,
    categoryId: string,
  ): Promise<InventoryCategoryItems | undefined> => {
    const categoriesToSync =
      items?.[selectedFilter]?.items?.filter(
        (item) => item.syncStatus === false,
      ) || [];

    if (categoriesToSync.length === 0) {
      toast({
        title: 'Info',
        description: `All ${selectedFilter} categories are already synced`,
      });
      return items;
    }

    try {
      const action = getAction(selectedFilter);

      const response = await mutate({
        variables: {
          brandId,
          categoryId,
          action,
          categories: categoriesToSync,
        },
      });

      if (response.data?.toSyncMsdProductCategories) {
        const updatedItems = {
          ...items,
          [selectedFilter]: {
            ...items[selectedFilter],
            items: items[selectedFilter]?.items?.map((item) => {
              const wasSynced = categoriesToSync.some((syncedItem) =>
                selectedFilter === 'delete'
                  ? syncedItem.code === item.code
                  : syncedItem.Code === item.Code,
              );

              if (wasSynced) {
                return { ...item, syncStatus: true };
              }
              return item;
            }),
          },
        };

        toast({
          title: 'Success',
          description: `${categoriesToSync.length} ${selectedFilter} categories synced`,
        });

        return updatedItems;
      }
    } catch (err) {
      toast({
        title: 'Error',
        description:
          err instanceof Error
            ? err.message
            : 'Failed to sync MS Dynamic categories',
        variant: 'destructive',
      });
    }
  };

  return { syncCategories, loading, error };
};
