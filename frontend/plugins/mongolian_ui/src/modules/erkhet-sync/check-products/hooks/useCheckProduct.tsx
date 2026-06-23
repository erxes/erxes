import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { atom, useAtom } from 'jotai';
import { useCallback, useMemo } from 'react';
import { checkProductsMutation } from '../graphql/mutations/checkProductsMutations';
import { ICheckProduct } from '../types/checkProduct';
import { ProductItem, ProductStatus } from '../types/productItem';
import { useSyncProduct } from './useSyncProduct';

interface CheckProductsResponse {
  create?: { items: ICheckProduct[] };
  update?: { items: ICheckProduct[] };
  delete?: { items: ICheckProduct[] };
  matched?: { count: number };
}

interface PageInfo {
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

const EMPTY_PAGE_INFO: PageInfo = {
  hasPreviousPage: false,
  hasNextPage: false,
};

const toCheckProductsAtom = atom<ProductItem[] | null>(null);
const toCheckProductsDataAtom = atom<CheckProductsResponse | null>(null);
const selectedFilterAtom = atom<ProductStatus>('create');
export const syncedProductCodesAtom = atom<Set<string>>(new Set<string>());

const buildProductItems = (
  responseData: CheckProductsResponse,
): ProductItem[] =>
  (['create', 'update', 'delete'] as const).flatMap<ProductItem>((status) =>
    (responseData[status]?.items ?? []).map(
      (item: ICheckProduct) => ({ ...item, status } as ProductItem),
    ),
  );

export const useCheckProduct = () => {
  const [toCheckProducts, setToCheckProducts] = useAtom(toCheckProductsAtom);
  const [toCheckProductsData, setToCheckProductsData] = useAtom(
    toCheckProductsDataAtom,
  );
  const [selectedFilter, setSelectedFilter] = useAtom(selectedFilterAtom);
  const [syncedCodes, setSyncedCodes] = useAtom(syncedProductCodesAtom);
  const [mutate, { loading, error }] = useMutation(checkProductsMutation);
  const {
    syncProducts: syncProductsAction,
    loading: syncLoading,
    error: syncError,
  } = useSyncProduct();

  const { toast } = useToast();

  const runCheck = useCallback(
    async (silent = false): Promise<ProductItem[] | null> => {
      try {
        const response = await mutate({
          onError: (mutationError) => {
            toast({
              title: 'Error',
              description: mutationError.message,
              variant: 'destructive',
            });
          },
        });

        const responseData: CheckProductsResponse | undefined =
          response.data?.toCheckProducts;

        if (!responseData) {
          return null;
        }

        const allProducts = buildProductItems(responseData);

        setToCheckProductsData(responseData);
        setToCheckProducts(allProducts);
        setSyncedCodes(new Set<string>());

        if (!silent) {
          const pendingCount = allProducts.length;
          toast({
            title: pendingCount > 0 ? 'Success' : 'Up to date',
            description:
              pendingCount > 0
                ? `${pendingCount} products to sync`
                : 'No products require syncing',
          });
        }

        return allProducts;
      } catch (err) {
        console.error('Check product error:', err);
        toast({
          title: 'Error',
          description: 'Failed to check products',
          variant: 'destructive',
        });
        return null;
      }
    },
    [mutate, setToCheckProducts, setToCheckProductsData, toast],
  );

  const checkProduct = useCallback(() => runCheck(false), [runCheck]);

  const syncProducts = useCallback(async () => {
    if (!toCheckProducts || toCheckProducts.length === 0) {
      toast({
        title: 'Warning',
        description: 'No products to sync',
        variant: 'destructive',
      });
      return;
    }

    const productsToSync = toCheckProducts.filter(
      (item) => item.status === selectedFilter,
    );

    const syncResult = await syncProductsAction(
      toCheckProducts,
      selectedFilter,
    );

    if (syncResult) {
      setSyncedCodes(new Set(productsToSync.map((item) => item.code)));
      await runCheck(true);
    }
  }, [
    runCheck,
    selectedFilter,
    syncProductsAction,
    toCheckProducts,
    toast,
  ]);

  const filteredProducts = useMemo<ProductItem[]>(
    () =>
      (toCheckProducts ?? [])
        .filter((item) => item.status === selectedFilter)
        .map((item) =>
          syncedCodes.has(item.code)
            ? { ...item, status: 'synced' as ProductStatus }
            : item,
        ),
    [toCheckProducts, selectedFilter, syncedCodes],
  );

  return {
    toCheckProducts,
    toCheckProductsData,
    selectedFilter,
    setSelectedFilter,
    filteredProducts,
    checkProduct,
    syncProducts,
    loading,
    syncLoading,
    error,
    syncError,
    pageInfo: EMPTY_PAGE_INFO,
  };
};
