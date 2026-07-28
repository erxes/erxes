import { useMutation } from '@apollo/client';
import { syncProductsMutation } from '../graphql/mutations/syncProductsMutations';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ProductItem, ProductStatus } from '../types/productItem';


const CHUNK_SIZE = 1000;

const getProductKey = (item: ProductItem): string | undefined =>
  item._id || item.id;

const toSyncPayload = (item: ProductItem) => ({
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
  is_deleted: item.is_deleted || false,
  is_service: item.is_service || false,
});

const chunkArray = <T,>(items: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

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
      const syncedIds = new Set<string>();
      let failed = false;

      for (const chunkItems of chunkArray(productsToSync, CHUNK_SIZE)) {
        try {
          const response = await mutate({
            variables: { action, products: chunkItems.map(toSyncPayload) },
          });

          if (response.data?.toSyncProducts) {
            for (const item of chunkItems) {
              const key = getProductKey(item);
              if (key) syncedIds.add(key);
            }
          }
        } catch (chunkError: any) {

          failed = true;
          toast({
            title: t('error'),
            description: chunkError?.message || t('sync-products-error'),
            variant: 'destructive',
          });
          break;
        }
      }

      if (syncedIds.size > 0) {
        const updatedProducts = toCheckProducts.map((item) => {
          const key = getProductKey(item);

          if (key && syncedIds.has(key) && item.status === selectedFilter) {
            return { ...item, isSynced: true };
          }
          return item;
        });

        toast({
          title: failed ? t('warning') : t('success'),
          description: t('products-synced', { count: syncedIds.size }),
        });

        return updatedProducts;
      }

      if (failed) {
        return toCheckProducts;
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
