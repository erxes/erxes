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

const getProductKey = (item: { _id?: string; id?: string }) =>
  item._id ?? item.id;

const buildProductItems = (
  responseData: CheckProductsResponse,
  previousItems: ProductItem[] | null,
): ProductItem[] => {
  const previousSynced =
    previousItems?.filter((item) => item.isSynced === true) ?? [];

  const incoming = ([
    'create',
    'update',
    'delete',
  ] as const).flatMap<ProductItem>((status) =>
    (responseData[status]?.items ?? []).map(
      (item: ICheckProduct) =>
        ({
          ...item,
          status,
          isSynced: false,
        }) as ProductItem,
    ),
  );

  const incomingKeys = new Set(incoming.map(getProductKey).filter(Boolean));
  const carriedSynced = previousSynced.filter(
    (item) => !incomingKeys.has(getProductKey(item)),
  );

  return [...carriedSynced, ...incoming];
};

export const useCheckProduct = () => {
  const [toCheckProducts, setToCheckProducts] = useAtom(toCheckProductsAtom);
  const [toCheckProductsData, setToCheckProductsData] = useAtom(
    toCheckProductsDataAtom,
  );
  const [selectedFilter, setSelectedFilter] = useAtom(selectedFilterAtom);
  const [mutate, { loading, error }] = useMutation(checkProductsMutation);
  const {
    syncProducts: syncProductsAction,
    loading: syncLoading,
    error: syncError,
  } = useSyncProduct();

  const { toast } = useToast();

  const checkProduct = useCallback(async () => {
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
        return;
      }

      const allProducts = buildProductItems(responseData, toCheckProducts);

      setToCheckProductsData(responseData);
      setToCheckProducts(allProducts);

      const pendingCount = allProducts.filter((item) => !item.isSynced).length;

      toast({
        title: pendingCount > 0 ? 'Success' : 'Up to date',
        description:
          pendingCount > 0
            ? `${pendingCount} products to sync`
            : 'No products require syncing',
      });
    } catch (err) {
      console.error('Check product error:', err);
      toast({
        title: 'Error',
        description: 'Failed to check products',
        variant: 'destructive',
      });
    }
  }, [mutate, setToCheckProducts, setToCheckProductsData, toCheckProducts, toast]);

  const syncProducts = useCallback(async () => {
    if (!toCheckProducts || toCheckProducts.length === 0) {
      toast({
        title: 'Warning',
        description: 'No products to sync',
        variant: 'destructive',
      });
      return;
    }

    const updatedProducts = await syncProductsAction(
      toCheckProducts,
      selectedFilter,
    );

    if (updatedProducts) {
      setToCheckProducts(updatedProducts);
    }
  }, [
    selectedFilter,
    setToCheckProducts,
    syncProductsAction,
    toCheckProducts,
    toast,
  ]);

  const filteredProducts = useMemo<ProductItem[]>(
    () =>
      (toCheckProducts ?? []).filter((item) => item.status === selectedFilter),
    [toCheckProducts, selectedFilter],
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
