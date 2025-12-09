import { useMutation } from '@apollo/client';
import { checkProductsMutation } from '../graphql/mutations/checkProductsMutations';
import { useToast } from 'erxes-ui';
import { useAtom, atom } from 'jotai';
import { ProductItem, ProductStatus } from '../types/productItem';
import { ICheckProduct } from '../types/checkProduct';
import { useSyncProduct } from './useSyncProduct';

interface CheckProductsResponse {
  create?: { items: ICheckProduct[] };
  update?: { items: ICheckProduct[] };
  delete?: { items: ICheckProduct[] };
}

interface PageInfo {
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

const toCheckProductsAtom = atom<ProductItem[] | null>(null);
const toCheckProductsDataAtom = atom<CheckProductsResponse | null>(null);
const selectedFilterAtom = atom<ProductStatus>('create');

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

  const checkProduct = async () => {
    try {
      const response = await mutate({
        onError: (error) => {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        },
      });

      const responseData = response.data?.toCheckProducts;

      if (responseData) {
        const existingSyncedProducts =
          toCheckProducts?.filter((item) => item.isSynced === true) || [];

        const allProducts: ProductItem[] = [
          ...existingSyncedProducts,
          ...(responseData.create?.items || []).map((item: ICheckProduct) => ({
            ...item,
            status: 'create' as const,
            isSynced: false,
          })),
          ...(responseData.update?.items || []).map((item: ICheckProduct) => ({
            ...item,
            status: 'update' as const,
            isSynced: false,
          })),
          ...(responseData.delete?.items || []).map((item: ICheckProduct) => ({
            ...item,
            status: 'delete' as const,
            isSynced: false,
          })),
        ];

        setToCheckProductsData(responseData);
        setToCheckProducts(allProducts);

        toast({
          title: 'Success',
          description: `${allProducts.length} products found`,
        });
      }
    } catch (err) {
      console.error('Check product error:', err);
      toast({
        title: 'Error',
        description: 'Failed to check products',
        variant: 'destructive',
      });
    }
  };

  const syncProducts = async () => {
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
  };

  const getFilteredProducts = (): ProductItem[] => {
    if (!toCheckProducts) return [];
    return toCheckProducts.filter((item) => item.status === selectedFilter);
  };

  const pageInfo: PageInfo = {
    hasPreviousPage: false,
    hasNextPage: false,
  };

  return {
    toCheckProducts,
    toCheckProductsData,
    selectedFilter,
    setSelectedFilter,
    filteredProducts: getFilteredProducts(),
    checkProduct,
    syncProducts,
    loading,
    syncLoading,
    error,
    syncError,
    pageInfo,
  };
};
