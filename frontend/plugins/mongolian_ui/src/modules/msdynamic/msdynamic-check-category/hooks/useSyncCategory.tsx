import { gql, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

import { mutations } from '../../graphql';
import {
  CategoryFilterType,
  InventoryCategoryAction,
  InventoryCategoryItem,
  InventoryCategoryItems,
} from '../types/inventoryCategory';

interface SyncCategoryMutationResponse {
  toSyncMsdProductCategories: { status: string };
}

/* UI filter-iig backend sync action ruu hurvuulna */
const getAction = (filter: CategoryFilterType): InventoryCategoryAction => {
  switch (filter) {
    case 'create':
      return 'CREATE';
    case 'update':
      return 'UPDATE';
    case 'delete':
      return 'DELETE';
    default:
      return 'CREATE';
  }
};

/* Category sync mutation bolon local synced state update-iig udirdana */
export const useSyncCategory = () => {
  const [mutate, { loading, error }] =
    useMutation<SyncCategoryMutationResponse>(gql(mutations.toSyncCategories));
  const { t } = useTranslation('mongolian');
  const { toast } = useToast();

  /* Unsynced MS Dynamic-aas irsen category-uudiig erxes ruu sync hiigeed shine state butsaana */
  const syncCategories = async (
    items: InventoryCategoryItems,
    selectedFilter: CategoryFilterType,
    brandId: string,
    categoryId?: string,
    selectedItems?: InventoryCategoryItem[],
  ): Promise<InventoryCategoryItems | undefined> => {
    const categoriesToSync =
      selectedItems ||
      items?.[selectedFilter]?.items?.filter(
        (item) => item.syncStatus === false,
      ) ||
      [];

    if (categoriesToSync.length === 0) {
      toast({
        title: t('info'),
        description: t('all-categories-synced', { filter: selectedFilter }),
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
              /* Delete rows are erxes categories, create/update rows are MS Dynamic categories. */
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
          title: t('success'),
          description: t('categories-synced', { count: categoriesToSync.length, filter: selectedFilter }),
        });

        return updatedItems;
      }

      return undefined;
    } catch {
      toast({
        title: t('error'),
        description: t('failed-to-sync-categories'),
        variant: 'destructive',
      });
      return undefined;
    }
  };

  return { syncCategories, loading, error };
};
