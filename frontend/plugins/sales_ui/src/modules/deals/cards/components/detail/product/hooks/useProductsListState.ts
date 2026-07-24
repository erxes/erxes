import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import { IProduct, IProductData } from 'ui-modules';

import { DEAL_PRODUCT_TOAST_OPTIONS } from '../constants';
import { isPatchAppliedByServer } from '../utils/isPatchAppliedByServer';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

interface UseSyncLocalProductsDataParams {
  productsData: IProductData[];
  setLocalProductsData: Dispatch<SetStateAction<IProductData[]>>;
  pendingProductPatchesRef: MutableRefObject<
    Record<string, Partial<IProductData>>
  >;
  pendingProductDeletionsRef: MutableRefObject<Set<string>>;
  productByIdRef: MutableRefObject<Record<string, IProduct>>;
  sortByStableProductOrder: (data: IProductData[]) => IProductData[];
}

// Reconciles server productsData with any optimistic local edits/deletes
// still in flight, so a stale server snapshot can't clobber them.
export const useSyncLocalProductsData = ({
  productsData,
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
      const incomingById = new Map<string, IProductData>();

      const updatedIncoming = incomingProductsData.map((data) => {
        const previousRecord = previousById.get(data._id);
        const pendingPatch = pendingProductPatchesRef.current[data._id];

        if (pendingPatch && isPatchAppliedByServer(data, pendingPatch)) {
          delete pendingProductPatchesRef.current[data._id];
        }

        const updatedProductData = {
          ...data,
          product:
            data.product ||
            previousRecord?.product ||
            (data.productId
              ? productByIdRef.current[data.productId]
              : undefined),
          ...(pendingProductPatchesRef.current[data._id] || {}),
        };

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
    setLocalProductsData,
    pendingProductPatchesRef,
    pendingProductDeletionsRef,
    productByIdRef,
    sortByStableProductOrder,
  ]);
};

interface UseVatPercentParams {
  localProductsData: IProductData[];
  setLocalProductsData: Dispatch<SetStateAction<IProductData[]>>;
  updateTotal: (productsData: IProductData[]) => void;
  calculatePerProductAmount: (
    type: string,
    productData: IProductData,
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
              ((p.unitPrice * 100) / (100 + (vatPercent || 0))).toFixed(4),
            ),
      };

      calculatePerProductAmount('', pData, false);

      return pData;
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
  localProductsData: IProductData[];
  products: IProduct[];
  dealId: string;
  editDeals: (options: {
    variables: {
      productsData: IProductData[];
      processId: string;
      _id: string;
    };
  }) => void;
}

export const useSaveDealProducts = ({
  localProductsData,
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
        ...DEAL_PRODUCT_TOAST_OPTIONS,
      });
    }
    const formattedProductsData = localProductsData.map((data) => ({
      ...data,
      productId: data.product?._id || data.productId,
    }));

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
