import { gql, useMutation } from '@apollo/client';
import { useSetAtom, useAtomValue } from 'jotai';
import { useToast } from 'erxes-ui';

import { mutations } from '@/msdynamic/graphql';

import {
  checkingAtom,
  productsAtom,
  productsDataAtom,
  syncingAtom,
} from '../states/msDynamicCheckProductsStates';
import {
  MSDYNAMIC_PRODUCT_ACTIONS,
  MSDynamicCheckProduct,
  MSDynamicCheckProductsResponse,
  MSDynamicCheckProductSource,
  MSDynamicCheckProductStatus,
} from '../types/msDynamicCheckProduct';

const CHECK_MSD_PRODUCTS = gql(mutations.toCheckProducts);
const SYNC_MSD_PRODUCTS = gql(mutations.toSyncProducts);
const productStatuses = ['create', 'update', 'delete'] as const;

type CheckMsdProductsData = {
  toCheckMsdProducts?: MSDynamicCheckProductsResponse;
};

type CheckMsdProductsVariables = {
  brandId: string;
};

type SyncMsdProductsData = {
  toSyncMsdProducts?: unknown;
};

type SyncMsdProductsVariables = {
  brandId: string;
  action: string;
  products: MSDynamicCheckProduct[];
};

type UseMSDynamicCheckProductsActionsProps = {
  brandId: string;
  hasDynamicConfig: boolean;
  selectedFilter: MSDynamicCheckProductStatus;
  syncableProducts: MSDynamicCheckProduct[];
};

const getProductKey = (product: MSDynamicCheckProductSource) =>
  product.Common_Item_No || product.No || product.code || '';

const getErrorMessage = (_error: unknown, fallback: string) => fallback;

const normalizeProduct = (
  product: MSDynamicCheckProductSource,
  status: MSDynamicCheckProductStatus,
): MSDynamicCheckProduct => {
  const displayCode =
    status === 'delete'
      ? product.code || product.Common_Item_No || product.No || ''
      : product.No || product.Common_Item_No || product.code || '';
  const displayName =
    status === 'delete'
      ? product.name || product.Description || ''
      : product.Description || product.name || '';
  const displayUnitPrice =
    status === 'delete'
      ? product.unitPrice || product.Unit_Price || 0
      : product.Unit_Price || product.unitPrice || 0;

  return {
    ...product,
    status,
    isSynced: product.syncStatus === true,
    syncStatus: product.syncStatus,
    displayCode: String(displayCode),
    displayName: String(displayName),
    displayUnitPrice,
    displayBarcodes: String(product.barcodes || product.Barcodes || ''),
  };
};

const normalizeProductsResponse = (response: MSDynamicCheckProductsResponse) =>
  productStatuses.flatMap((status) =>
    (response[status]?.items || []).map((product) =>
      normalizeProduct({ ...product, syncStatus: false }, status),
    ),
  );

const markSyncedProducts = (
  products: MSDynamicCheckProduct[],
  selectedProducts: MSDynamicCheckProduct[],
  status: MSDynamicCheckProductStatus,
) => {
  const syncedProductKeys = new Set(selectedProducts.map(getProductKey));

  return products.map((product) => {
    if (
      product.status !== status ||
      !syncedProductKeys.has(getProductKey(product))
    ) {
      return product;
    }

    return { ...product, syncStatus: true, isSynced: true };
  });
};

const groupProductsData = (
  products: MSDynamicCheckProduct[],
  previousData: MSDynamicCheckProductsResponse | null,
): MSDynamicCheckProductsResponse => ({
  matched: previousData?.matched,
  create: { items: products.filter((product) => product.status === 'create') },
  update: { items: products.filter((product) => product.status === 'update') },
  delete: { items: products.filter((product) => product.status === 'delete') },
});

export const useMSDynamicCheckProductsActions = ({
  brandId,
  hasDynamicConfig,
  selectedFilter,
  syncableProducts,
}: UseMSDynamicCheckProductsActionsProps) => {
  const productsValue = useAtomValue(productsAtom);
  const productsData = useAtomValue(productsDataAtom);
  const setProducts = useSetAtom(productsAtom);
  const setProductsData = useSetAtom(productsDataAtom);
  const setChecking = useSetAtom(checkingAtom);
  const setSyncing = useSetAtom(syncingAtom);
  const { toast } = useToast();

  const [checkMsdProducts] = useMutation<
    CheckMsdProductsData,
    CheckMsdProductsVariables
  >(CHECK_MSD_PRODUCTS);
  const [syncMsdProducts] = useMutation<
    SyncMsdProductsData,
    SyncMsdProductsVariables
  >(SYNC_MSD_PRODUCTS);

  const checkProducts = async () => {
    if (!hasDynamicConfig) {
      toast({
        title: 'Error',
        description:
          'MS Dynamic config not found for the selected brand. Configure MS Dynamic settings first.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setChecking(true);

      const response = await checkMsdProducts({ variables: { brandId } });
      const responseData = response.data?.toCheckMsdProducts;

      if (!responseData) {
        setProducts([]);
        setProductsData(null);
        return;
      }

      const normalizedProducts = normalizeProductsResponse(responseData);
      setProducts(normalizedProducts);
      setProductsData(responseData);

      toast({
        title: 'Success',
        description: `${normalizedProducts.length} products found`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to check products'),
        variant: 'destructive',
      });
    } finally {
      setChecking(false);
    }
  };

  const syncProducts = async () => {
    if (!hasDynamicConfig) {
      toast({
        title: 'Error',
        description:
          'MS Dynamic config not found for the selected brand. Configure MS Dynamic settings first.',
        variant: 'destructive',
      });
      return;
    }

    if (!syncableProducts.length) {
      toast({
        title: 'Warning',
        description: 'No products to sync',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSyncing(true);

      await syncMsdProducts({
        variables: {
          brandId,
          action: MSDYNAMIC_PRODUCT_ACTIONS[selectedFilter],
          products: syncableProducts,
        },
      });

      const nextProducts = markSyncedProducts(
        productsValue || [],
        syncableProducts,
        selectedFilter,
      );
      setProducts(nextProducts);
      setProductsData(groupProductsData(nextProducts, productsData));

      toast({
        title: 'Success',
        description: `${syncableProducts.length} products synced`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to sync products'),
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  return { checkProducts, syncProducts };
};
