import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useCallback } from 'react';
import { syncProductsMutation } from '../graphql/mutations/syncProductsMutations';
import { ProductItem, ProductStatus } from '../types/productItem';

const getProductKey = (item: { _id?: string; id?: string }) =>
  item._id ?? item.id;

export const useSyncProduct = () => {
  const [mutate, { loading, error }] = useMutation(syncProductsMutation);
  const { toast } = useToast();

  const syncProducts = useCallback(
    async (
      toCheckProducts: ProductItem[],
      selectedFilter: ProductStatus,
    ): Promise<ProductItem[] | undefined> => {
      if (!toCheckProducts || toCheckProducts.length === 0) {
        toast({
          title: 'Error',
          description: 'Sync products not found',
          variant: 'destructive',
        });
        return;
      }

      const productsToSync = toCheckProducts.filter(
        (item) => item.status === selectedFilter && !item.isSynced,
      );

      if (productsToSync.length === 0) {
        toast({
          title: 'Info',
          description: `All ${selectedFilter} products are already synced`,
        });
        return toCheckProducts;
      }

      let mutationFailed = false;

      try {
        const response = await mutate({
          variables: {
            action: selectedFilter.toUpperCase(),
            products: productsToSync.map((item) => ({
              id: getProductKey(item),
              code: item.code,
              name: item.name,
              barcodes: item.barcodes,
              unit_price: item.unit_price,
              category_code: item.category_code,
              measure_unit_code: item.measure_unit_code,
              vat_type_code: item.vat_type_code,
              ratio_measure_unit: item.ratio_measure_unit,
              sub_measure_unit_code: item.sub_measure_unit_code,
              category: item.category,
              group: item.group,
              brand_code: item.brand_code,
              sub_measure_unit: item.sub_measure_unit,
              united_code: item.united_code,
              measure_unit: item.measure_unit,
              brand: item.brand,
              vat_type: item.vat_type,
              nickname: item.nickname,
              group_code: item.group_code,
              is_deleted: item.is_deleted ?? false,
              is_service: item.is_service ?? false,
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

        if (!response.data?.toSyncProducts) {
          return;
        }

        const syncedKeys = new Set(
          productsToSync.map(getProductKey).filter(Boolean),
        );

        const updatedProducts = toCheckProducts.map((item) => {
          const key = getProductKey(item);
          if (key && syncedKeys.has(key)) {
            return { ...item, isSynced: true };
          }
          return item;
        });

        toast({
          title: 'Success',
          description: `${productsToSync.length} ${selectedFilter} products synced`,
        });

        return updatedProducts;
      } catch (err) {
        if (mutationFailed) {
          return;
        }
        console.error('Sync products error:', err);
        toast({
          title: 'Error',
          description: 'Sync products error',
          variant: 'destructive',
        });
      }
    },
    [mutate, toast],
  );

  return {
    syncProducts,
    loading,
    error,
  };
};
