import type { DealProduct, DealProductData } from '@/deals/utils/dealJson';
import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect, useRef, useState } from 'react';
import { currentUserState } from 'ui-modules';

import { ProductFilterState } from '@/deals/actionBar/types/actionBarTypes';
import { useDealsEdit } from '@/deals/cards/hooks/useDeals';
import { DEAL_TOAST_OPTIONS } from '@/deals/constants/toast';
import { Dialog } from 'erxes-ui';
import { useDealProductActions } from '../../hooks/useDealProductActions';
import { useProductCalculations } from '../../hooks/useProductCalculations';
import {
  useSaveDealProducts,
  useSyncLocalProductsData,
  useVatPercent,
} from '../../hooks/useProductsListState';
import {
  onLocalChangeAtom,
  productRowActionsAtom,
} from '../../productTableAtom';
import { ProductDataWithDiscountInfos } from '../../utils/discountInfos';
import { filterProducts } from '../../utils/filterProducts';
import { normalizeProductUom } from '../../utils/productUom';
import { ProductsRecordTable } from '../product-table/ProductRecordTable';
import { ProductEditSheet } from '../ProductEditSheet';
import { ProductFooter } from '../ProductFooter';
import { ProductsListHeader } from './ProductsListHeader';

export const ProductsList = ({
  products,
  productsData,
  dealId,
  pipelineId,
  refetch,
  tickUsed,
}: {
  products: DealProduct[];
  productsData: DealProductData[];
  dealId: string;
  pipelineId?: string;
  refetch: () => void;
  tickUsed: boolean;
}) => {
  const currentUser = useAtomValue(currentUserState);
  const defaultCurrency = currentUser?.configs?.dealCurrency?.[0] || 'MNT';
  const [localProductsData, setLocalProductsData] =
    useState<DealProductData[]>(productsData);
  const pendingProductPatchesRef = useRef<
    Record<string, Partial<DealProductData>>
  >({});
  const productOrderRef = useRef<Array<DealProductData['_id']>>(
    (productsData || []).map((data) => data._id),
  );
  const productByIdRef = useRef<Record<string, DealProduct>>(
    products.reduce<Record<string, DealProduct>>((acc, product) => {
      acc[product._id] = product;
      return acc;
    }, {}),
  );
  const setOnLocalChange = useSetAtom(onLocalChangeAtom);
  const setProductRowActions = useSetAtom(productRowActionsAtom);

  const [filters, setFilters] = useState<ProductFilterState>({});

  const {
    total,
    unUsedTotal,
    bothTotal,
    tax,
    discount,
    updateTotal,
    calculatePerProductAmount,
  } = useProductCalculations(localProductsData);
  const { editDeals } = useDealsEdit(undefined, {
    toastOptions: DEAL_TOAST_OPTIONS,
  });
  const [showAdvancedView, setShowAdvancedView] = useState(false);
  const [showTaxView, setShowTaxView] = useState(false);
  const [showExpandedView, setShowExpandedView] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DealProductData | null>(
    null,
  );

  localProductsData.forEach((data) => {
    if (data.product?._id) {
      productByIdRef.current[data.product._id] = {
        ...data.product,
        ...productByIdRef.current[data.product._id],
      };
    }
  });
  products.forEach((product) => {
    productByIdRef.current[product._id] = {
      ...productByIdRef.current[product._id],
      ...product,
    };
  });

  const availableProducts = Object.values(productByIdRef.current);

  const filteredProducts = filterProducts(availableProducts, filters);

  const productRecords = localProductsData
    .map((data) => {
      const productId = data.product?._id || data.productId;
      const product = productId
        ? productByIdRef.current[productId]
        : data.product;

      return {
        ...normalizeProductUom(data, product),
        product,
        currency: data.currency?.trim() ? data.currency : defaultCurrency,
      };
    })
    .filter((record) => {
      if (!record.product) return false;
      return filteredProducts.some((p) => p._id === record.product?._id);
    });

  const sortByStableProductOrder = useCallback((data: DealProductData[]) => {
    const ids = data.map((productData) => productData._id);
    productOrderRef.current = [
      ...productOrderRef.current.filter((id) => ids.includes(id)),
      ...ids.filter((id) => !productOrderRef.current.includes(id)),
    ];

    const orderById = new Map(
      productOrderRef.current.map((id, index) => [id, index]),
    );

    return [...data].sort(
      (a, b) =>
        (orderById.get(a._id) ?? Number.MAX_SAFE_INTEGER) -
        (orderById.get(b._id) ?? Number.MAX_SAFE_INTEGER),
    );
  }, []);

  const {
    addProducts,
    duplicateProduct,
    deleteProduct,
    pendingProductDeletionsRef,
  } = useDealProductActions({
    tickUsed,
    tax,
    discount,
    setLocalProductsData,
    updateTotal,
    calculatePerProductAmount,
    sortByStableProductOrder,
  });

  const {
    vatPercent,
    vatPercentDraft,
    onVatPercentChange,
    onVatPercentBlur,
    applyVat,
  } = useVatPercent({
    localProductsData,
    setLocalProductsData,
    updateTotal,
    calculatePerProductAmount,
  });

  const { handleSave } = useSaveDealProducts({
    localProductsData,
    defaultCurrency,
    products,
    dealId,
    editDeals,
  });

  const openProductEditSheet = useCallback(
    (productData: DealProductData) => setEditingProduct(productData),
    [],
  );

  const updateLocalProduct = useCallback(
    (
      id: string,
      patch: Partial<ProductDataWithDiscountInfos>,
      options?: { syncProductId?: string },
    ) => {
      setLocalProductsData((prev) => {
        const affectedProductData = prev.filter(
          (productData) =>
            productData._id === id ||
            (options?.syncProductId &&
              (productData.productId || productData.product?._id) ===
                options.syncProductId),
        );

        affectedProductData.forEach((productData) => {
          pendingProductPatchesRef.current[String(productData._id)] = {
            ...pendingProductPatchesRef.current[String(productData._id)],
            ...patch,
          };
        });

        const affectedIds = new Set(
          affectedProductData.map((productData) => productData._id),
        );
        const updated = prev.map((productData) =>
          affectedIds.has(productData._id)
            ? { ...productData, ...patch }
            : productData,
        );

        updateTotal(updated);
        return updated;
      });
    },
    [updateTotal],
  );

  useSyncLocalProductsData({
    productsData,
    defaultCurrency,
    setLocalProductsData,
    pendingProductPatchesRef,
    pendingProductDeletionsRef,
    productByIdRef,
    sortByStableProductOrder,
  });

  useEffect(() => {
    setOnLocalChange(() => updateLocalProduct);
    return () => setOnLocalChange(null);
  }, [setOnLocalChange, updateLocalProduct]);

  useEffect(() => {
    setProductRowActions({
      onEdit: openProductEditSheet,
      onDuplicate: duplicateProduct,
      onDelete: deleteProduct,
    });
    return () => setProductRowActions(null);
  }, [
    setProductRowActions,
    openProductEditSheet,
    duplicateProduct,
    deleteProduct,
  ]);

  const hasProductFilters = Object.values(filters).some((value) =>
    Array.isArray(value) ? value.length > 0 : Boolean(value),
  );

  const productWorkspace = (
    <>
      <ProductsListHeader
        filters={filters}
        onFiltersChange={setFilters}
        vatPercent={vatPercent}
        vatPercentDraft={vatPercentDraft}
        onVatPercentChange={onVatPercentChange}
        onVatPercentBlur={onVatPercentBlur}
        onApplyVat={applyVat}
        showAdvancedView={showAdvancedView}
        onShowAdvancedViewChange={setShowAdvancedView}
        showTaxView={showTaxView}
        onShowTaxViewChange={setShowTaxView}
        showExpandedView={showExpandedView}
        onShowExpandedViewChange={setShowExpandedView}
      />

      <div className="min-h-0 flex-1 py-4">
        <ProductsRecordTable
          products={productRecords}
          refetch={refetch}
          showAdvancedView={showAdvancedView}
          showTaxView={showTaxView}
          hasProductFilters={hasProductFilters}
        />
      </div>

      <ProductFooter
        productsCount={localProductsData.length}
        total={total}
        unUsedTotal={unUsedTotal}
        bothTotal={bothTotal}
        discount={discount}
        tax={tax}
        showAdvancedView={showAdvancedView}
        showTaxView={showTaxView}
        productsData={localProductsData}
        pipelineId={pipelineId}
        onChangeProductsData={setLocalProductsData}
        updateTotal={updateTotal}
        onAddProducts={addProducts}
        onSave={handleSave}
      />
    </>
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      {showExpandedView ? (
        <Dialog open={showExpandedView} onOpenChange={setShowExpandedView}>
          <Dialog.Content className="flex h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-none flex-col gap-0 overflow-hidden p-4">
            <Dialog.Header className="sr-only">
              <Dialog.Title>Products</Dialog.Title>
              <Dialog.Description>
                Expanded product management view
              </Dialog.Description>
            </Dialog.Header>
            {productWorkspace}
          </Dialog.Content>
        </Dialog>
      ) : (
        productWorkspace
      )}

      <ProductEditSheet
        productData={editingProduct}
        open={Boolean(editingProduct)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingProduct(null);
          }
        }}
      />
    </div>
  );
};
