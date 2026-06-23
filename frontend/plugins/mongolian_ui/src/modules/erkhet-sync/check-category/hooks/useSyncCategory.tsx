import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useCallback } from 'react';
import { syncCategoriesMutation } from '../graphql/mutations/syncCategriesMutations';
import { CategoryItem, CategoryStatus } from '../types/categoryItem';

interface SyncResult {
  success: number;
  failed: number;
}

export const useSyncCategory = () => {
  const [mutate, { loading, error }] = useMutation(syncCategoriesMutation);
  const { toast } = useToast();

  const syncCategories = useCallback(
    async (
      toCheckCategories: CategoryItem[],
      selectedFilter: CategoryStatus,
    ): Promise<SyncResult | undefined> => {
      const categoriesToSync = toCheckCategories.filter(
        (item) => item.status === selectedFilter,
      );

      if (categoriesToSync.length === 0) {
        toast({
          title: 'Info',
          description: `No ${selectedFilter} categories to sync`,
        });
        return;
      }

      let mutationFailed = false;

      try {
        const response = await mutate({
          variables: {
            action: selectedFilter.toUpperCase(),
            categories: categoriesToSync.map((item) => ({
              id: item._id ?? item.id,
              code: item.code,
              name: item.name,
              parent: item.parent,
              is_citytax: item.is_citytax ?? false,
              is_raw: item.is_raw ?? false,
              citytax_row: item.citytax_row,
              is_service: item.is_service ?? false,
              is_sellable: item.is_sellable ?? true,
              order: item.order ?? '0!',
              parent_code: item.parent_code,
            })),
          },
          onError: (mutationError) => {
            mutationFailed = true;
            toast({
              title: 'Error',
              description: mutationError.message,
              variant: 'destructive',
            });
          },
        });

        const result = response.data?.toSyncCategories;
        if (!result) return;

        const success = result.success ?? categoriesToSync.length;
        const failed = result.failed ?? 0;

        toast({
          title: failed === 0 ? 'Success' : 'Partial',
          description:
            failed === 0
              ? `${success} ${selectedFilter} categories synced`
              : `${success} synced, ${failed} failed`,
          variant: failed === 0 ? undefined : 'destructive',
        });

        return { success, failed };
      } catch (err) {
        if (mutationFailed) return;
        console.error('Sync categories error:', err);
        toast({
          title: 'Error',
          description: 'Sync categories error',
          variant: 'destructive',
        });
      }
    },
    [mutate, toast],
  );

  return {
    syncCategories,
    loading,
    error,
  };
};
