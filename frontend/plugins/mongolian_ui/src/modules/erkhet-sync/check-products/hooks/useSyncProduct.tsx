import { useMutation } from '@apollo/client';
import { syncProductsMutation } from '../graphql/mutations/syncProductsMutations';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ProductItem, ProductStatus } from '../types/productItem';

export const useSyncProduct = () => {
  const [mutate, { loading, error }] = useMutation(syncProductsMutation);
  const { toast } = useToast();
  const { t } = useTranslation('mongolian');

  const syncProducts = async (
    toCheckProducts: ProductItem[],
    selectedFilter: ProductStatus,
  ): Promise<ProductItem[] | undefined> => {
    if (!toCheckProducts || toCheckProducts.length === 0) {
      toast({
        title: t('error'),
        description: t('sync-products-not-found'),
        variant: 'destructive',
      });
      return;
    }

    const productsToSync = toCheckProducts.filter(
      (item) => item.status === selectedFilter && !item.isSynced,
    );

    if (productsToSync.length === 0) {
      toast({
        title: t('info'),
        description: t('all-products-already-synced'),
      });
      return toCheckProducts;
    }

    try {
      const action = selectedFilter.toUpperCase();

      const response = await mutate({
        variables: {
          action,
          products: productsToSync.map((item) => ({
            id: item._id || item.id,
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
            is_deleted: item.is_deleted || false,
            is_service: item.is_service || false,
          })),
        },
        onError: (error) => {
          toast({
            title: t('error'),
            description: error.message,
            variant: 'destructive',
          });
        },
      });

      if (response.data?.toSyncProducts) {
        const updatedProducts = toCheckProducts.map((item) => {
          const wasSynced = productsToSync.some(
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
          title: t('success'),
          description: t('products-synced', { count: productsToSync.length }),
        });

        return updatedProducts;
      }
    } catch (err) {
      console.error('Sync products error:', err);
      toast({
        title: t('error'),
        description: t('sync-products-error'),
        variant: 'destructive',
      });
    }
  };

  return {
    syncProducts,
    loading,
    error,
  };
};
