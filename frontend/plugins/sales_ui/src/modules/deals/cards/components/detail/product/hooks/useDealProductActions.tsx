import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { IProduct, IProductData, currentUserState } from 'ui-modules';

import { AdjustmentByCurrency } from './useProductCalculations';
import { useAtomValue } from 'jotai';
import { useDealsCreateProductsData } from './mutations/useDealsCreateProductsData';
import { useRemoveProducts } from './mutations/useRemoveProduct';

interface UseDealProductActionsParams {
  tickUsed: boolean;
  tax: AdjustmentByCurrency;
  discount: AdjustmentByCurrency;
  setLocalProductsData: Dispatch<SetStateAction<IProductData[]>>;
  updateTotal: (productsData: IProductData[]) => void;
  calculatePerProductAmount: (
    type: string,
    productData: IProductData,
    callUpdateTotal?: boolean,
  ) => void;
  sortByStableProductOrder: (productsData: IProductData[]) => IProductData[];
}

const startProcess = () => {
  const processId = crypto.randomUUID();
  localStorage.setItem('processId', processId);
  return processId;
};

export const useDealProductActions = ({
  tickUsed,
  tax,
  discount,
  setLocalProductsData,
  updateTotal,
  calculatePerProductAmount,
  sortByStableProductOrder,
}: UseDealProductActionsParams) => {
  const { createDealsProductData } = useDealsCreateProductsData();
  const { removeProducts } = useRemoveProducts();
  const currentUser = useAtomValue(currentUserState);
  const currencies = useMemo(
    () => currentUser?.configs?.dealCurrency || [],
    [currentUser],
  );

  // Deletions in flight: read by ProductsList's server-sync effect so a
  // pending delete isn't resurrected by a stale productsData snapshot.
  const pendingProductDeletionsRef = useRef(new Set<string>());

  const appendRows = useCallback(
    (rows: IProductData[]) => {
      setLocalProductsData((prev) => {
        const next = [...prev, ...rows];
        updateTotal(next);
        return next;
      });
    },
    [setLocalProductsData, updateTotal],
  );

  const removeRows = useCallback(
    (ids: string[]) => {
      setLocalProductsData((prev) => {
        const next = prev.filter((row) => !ids.includes(row._id));
        updateTotal(next);
        return next;
      });
    },
    [setLocalProductsData, updateTotal],
  );

  const createProductsData = useCallback(
    (docs: IProductData[], rows: IProductData[]) => {
      const processId = startProcess();

      appendRows(rows);

      void createDealsProductData({
        variables: {
          processId,
          docs,
        },
      }).catch(() => {
        removeRows(rows.map((row) => row._id));
      });
    },
    [appendRows, createDealsProductData, removeRows],
  );

  const addProducts = useCallback(
    (selectedProducts: IProduct[]) => {
      if (!selectedProducts?.length) return;
      const currency = currencies.length > 0 ? currencies[0] : 'MNT';

      const rows = selectedProducts.map((product) => {
        const row: IProductData = {
          tax: 0,
          taxPercent: tax[currency]?.percent || 0,
          discount: 0,
          vatPercent: 0,
          discountPercent: discount[currency]?.percent || 0,
          amount: 0,
          currency,
          tickUsed,
          maxQuantity: 0,
          product,
          quantity: 1,
          productId: product._id,
          unitPrice: product.unitPrice,
          globalUnitPrice: product.unitPrice,
          unitPricePercent: 100,
          _id: crypto.randomUUID(),
        };

        calculatePerProductAmount('discount', row);

        return row;
      });

      createProductsData(rows, rows);
    },
    [
      calculatePerProductAmount,
      createProductsData,
      currencies,
      discount,
      tax,
      tickUsed,
    ],
  );

  const duplicateProduct = useCallback(
    (productData: IProductData) => {
      // The server persists docs verbatim, so send only persisted fields —
      // not the embedded product object or bundle conditions.
      const doc: IProductData = {
        _id: crypto.randomUUID(),
        productId: productData.productId || productData.product?._id,
        uom: productData.uom,
        currency: productData.currency,
        quantity: productData.quantity,
        unitPrice: productData.unitPrice,
        globalUnitPrice: productData.globalUnitPrice,
        unitPricePercent: productData.unitPricePercent,
        taxPercent: productData.taxPercent,
        tax: productData.tax,
        vatPercent: productData.vatPercent,
        discountPercent: productData.discountPercent,
        discount: productData.discount,
        amount: productData.amount,
        tickUsed: productData.tickUsed,
        isVatApplied: productData.isVatApplied,
        assignUserId: productData.assignUserId,
        maxQuantity: productData.maxQuantity,
        branchId: productData.branchId,
        departmentId: productData.departmentId,
      };

      createProductsData([doc], [{ ...doc, product: productData.product }]);
    },
    [createProductsData],
  );

  const deleteProduct = useCallback(
    (productData: IProductData) => {
      pendingProductDeletionsRef.current.add(productData._id);
      removeRows([productData._id]);

      const processId = localStorage.getItem('processId') || '';

      void removeProducts({
        variables: {
          processId,
          dataIds: [productData._id],
        },
        onError: () => {
          pendingProductDeletionsRef.current.delete(productData._id);
          setLocalProductsData((prev) => {
            if (prev.some((data) => data._id === productData._id)) {
              return prev;
            }

            const restoredProductsData = sortByStableProductOrder([
              ...prev,
              productData,
            ]);
            updateTotal(restoredProductsData);
            return restoredProductsData;
          });
        },
      });
    },
    [
      removeProducts,
      removeRows,
      setLocalProductsData,
      sortByStableProductOrder,
      updateTotal,
    ],
  );

  return {
    addProducts,
    duplicateProduct,
    deleteProduct,
    pendingProductDeletionsRef,
  };
};
