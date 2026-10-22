import type { DealProduct, DealProductData } from '@/deals/utils/dealJson';
import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useEffect,
  useState,
} from 'react';

import { DEAL_TOAST_OPTIONS } from '@/deals/constants/toast';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { isPatchAppliedByServer } from '../utils/isPatchAppliedByServer';
import { normalizeProductUom, syncProductUomInfo } from '../utils/productUom';

interface UseSyncLocalProductsDataParams {
  productsData: DealProductData[];
  defaultCurrency: string;
  setLocalProductsData: Dispatch<SetStateAction<DealProductData[]>>;
  pendingProductPatchesRef: MutableRefObject<
    Record<string, Partial<DealProductData>>
  >;
  pendingProductDeletionsRef: MutableRefObject<Set<DealProductData['_id']>>;
  productByIdRef: MutableRefObject<Record<string, DealProduct>>;
  sortByStableProductOrder: (data: DealProductData[]) => DealProductData[];
}

// Reconciles server productsData with any optimistic local edits/deletes
// still in flight, so a stale server snapshot can't clobber them.
export const useSyncLocalProductsData = ({
  productsData,
  defaultCurrency,
  setLocalProductsData,
  pendingProductPatchesRef,
  pendingProductDeletionsRef,
  productByIdRef,
  sortByStableProductOrder,
}: UseSyncLocalProductsDataParams) => {
  useEffect(() => {
    setLocalProductsData((prev) => {
      const hasPendingPatches =
        Object.keys(pendingProductPatchesRef.current).length > 0;
      const serverProductsData = productsData || [];
      const serverProductIds = new Set(
        serverProductsData.map((data) => data._id),
      );

      pendingProductDeletionsRef.current.forEach((productDataId) => {
        if (!serverProductIds.has(productDataId)) {
          pendingProductDeletionsRef.current.delete(productDataId);
        }
      });

      const incomingProductsData = serverProductsData.filter(
        (data) => !pendingProductDeletionsRef.current.has(data._id),
      );
      const previousById = new Map(prev.map((data) => [data._id, data]));
      const incomingById = new Map<DealProductData['_id'], DealProductData>();

      const updatedIncoming = incomingProductsData.map((data) => {
        const previousRecord = previousById.get(data._id);
        const pendingPatch = pendingProductPatchesRef.current[String(data._id)];

        if (pendingPatch && isPatchAppliedByServer(data, pendingPatch)) {
          delete pendingProductPatchesRef.current[String(data._id)];
        }

        const incomingProductData = {
          ...data,
          product:
            data.product ||
            previousRecord?.product ||
            (data.productId
              ? productByIdRef.current[data.productId]
              : undefined),
          ...pendingProductPatchesRef.current[String(data._id)],
        };
        const productId =
          incomingProductData.product?._id || incomingProductData.productId;
        const updatedProductData = syncProductUomInfo(
          incomingProductData,
          (productId ? productByIdRef.current[productId] : undefined) ||
            incomingProductData.product,
        );
        if (!updatedProductData.currency?.trim()) {
          updatedProductData.currency = defaultCurrency;
        }

        incomingById.set(data._id, updatedProductData);

        return updatedProductData;
      });

      const updated =
        hasPendingPatches && incomingProductsData.length < prev.length
          ? [
              ...prev.map((data) => incomingById.get(data._id) || data),
              ...updatedIncoming.filter((data) => !previousById.has(data._id)),
            ]
          : updatedIncoming;

      return sortByStableProductOrder(updated);
    });
  }, [
    productsData,
    defaultCurrency,
    setLocalProductsData,
    pendingProductPatchesRef,
    pendingProductDeletionsRef,
    productByIdRef,
    sortByStableProductOrder,
  ]);
};

interface UseVatPercentParams {
  localProductsData: DealProductData[];
  setLocalProductsData: Dispatch<SetStateAction<DealProductData[]>>;
  updateTotal: (productsData: DealProductData[]) => void;
  calculatePerProductAmount: (
    type: string,
    productData: DealProductData,
    callUpdateTotal?: boolean,
  ) => void;
}

export const useVatPercent = ({
  localProductsData,
  setLocalProductsData,
  updateTotal,
  calculatePerProductAmount,
}: UseVatPercentParams) => {
  const [vatPercent, setVatPercent] = useState(0);
  const [vatPercentDraft, setVatPercentDraft] = useState<string | null>(null);

  const onVatPercentChange = (inputValue: string) => {
    if (inputValue === '') {
      setVatPercentDraft('');
      setVatPercent(0);
      return;
    }

    const parsedValue = Number.parseFloat(inputValue);

    if (Number.isNaN(parsedValue) || parsedValue < 0 || parsedValue > 100) {
      return;
    }

    setVatPercentDraft(inputValue);
    setVatPercent(parsedValue);
  };

  const onVatPercentBlur = () => setVatPercentDraft(null);

  const applyVat = () => {
    const updatedData = (localProductsData || []).map((p) => {
      const pData = {
        ...p,
        isVatApplied: true,
        unitPrice: p.isVatApplied
          ? p.unitPrice
          : Number.parseFloat(
              (((p.unitPrice ?? 0) * 100) / (100 + (vatPercent || 0))).toFixed(
                4,
              ),
            ),
      };

      calculatePerProductAmount('', pData, false);

      return syncProductUomInfo(pData);
    });

    setLocalProductsData(updatedData);
    updateTotal(updatedData);
  };

  return {
    vatPercent,
    vatPercentDraft,
    onVatPercentChange,
    onVatPercentBlur,
    applyVat,
  };
};

interface UseSaveDealProductsParams {
  localProductsData: DealProductData[];
  defaultCurrency: string;
  products: DealProduct[];
  dealId: string;
  editDeals: (options: {
    variables: {
      productsData: DealProductData[];
      processId: string;
      _id: string;
    };
  }) => void;
}

export const useSaveDealProducts = ({
  localProductsData,
  defaultCurrency,
  products,
  dealId,
  editDeals,
}: UseSaveDealProductsParams) => {
  const { toast } = useToast();
  const { t } = useTranslation('sales');

  const handleSave = () => {
    const processId = localStorage.getItem('processId') || '';
    const unassignedServiceItems = localProductsData.filter((data) => {
      const product =
        data.product || products.find((p) => p._id === data.productId);
      const assignee = data.assignedUserId || data.assignUserId;
      return product?.type === 'service' && data.tickUsed && !assignee;
    });

    if (unassignedServiceItems.length > 0) {
      const names = unassignedServiceItems
        .map((data) => {
          const product =
            data.product || products.find((p) => p._id === data.productId);
          return product?.name || data.productId;
        })
        .join(', ');
      return toast({
        variant: 'destructive',
        title: t('error'),
        description: t('assign-service-before-saving', { names }),
        ...DEAL_TOAST_OPTIONS,
      });
    }
    const formattedProductsData = localProductsData.map((data) => {
      const productId = data.product?._id || data.productId;
      const product =
        products.find((product) => product._id === productId) || data.product;

      return {
        ...normalizeProductUom(data, product),
        productId,
        currency: data.currency?.trim() ? data.currency : defaultCurrency,
      };
    });

    editDeals({
      variables: {
        productsData: formattedProductsData,
        processId,
        _id: dealId,
      },
    });
  };

  return { handleSave };
};
