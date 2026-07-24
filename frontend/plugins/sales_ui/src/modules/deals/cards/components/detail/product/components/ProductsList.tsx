import { Button, Filter, Input, Label, Switch, useToast } from 'erxes-ui';
import { FilterButton, ProductFilterBar } from './FilterButton';
import { IProduct, IProductData, currentUserState } from 'ui-modules';
import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect, useRef, useState } from 'react';

import { IconSearch } from '@tabler/icons-react';
import { ProductFilterState } from '@/deals/actionBar/types/actionBarTypes';
import { ProductFooter } from './ProductFooter';
import { ProductsRecordTable } from './ProductRecordTable';
import { onLocalChangeAtom } from '../productTableAtom';
import { useDealsCreateProductsData } from '../hooks/useDealsCreateProductsData';
import { useDealsEdit } from '@/deals/cards/hooks/useDeals';
import { useProductCalculations } from '../hooks/useProductCalculations';
import { filterProducts } from '../utils/filterProducts';
import { useTranslation } from 'react-i18next';

const isPatchAppliedByServer = (
  data: IProductData,
  patch: Partial<IProductData>,
) =>
  Object.entries(patch).every(([key, value]) =>
    Object.is(data[key as keyof IProductData], value),
  );

export const ProductsList = ({
  products,
  productsData,
  dealId,
  refetch,
  tickUsed,
}: {
  products: IProduct[];
  productsData: IProductData[];
  dealId: string;
  refetch: () => void;
  tickUsed: boolean;
}) => {
  const { createDealsProductData } = useDealsCreateProductsData();
  const [localProductsData, setLocalProductsData] =
    useState<IProductData[]>(productsData);
  const pendingProductPatchesRef = useRef<
    Record<string, Partial<IProductData>>
  >({});
  const productOrderRef = useRef<string[]>(
    (productsData || []).map((data) => data._id),
  );
  const productByIdRef = useRef<Record<string, IProduct>>(
    products.reduce<Record<string, IProduct>>((acc, product) => {
      acc[product._id] = product;
      return acc;
    }, {}),
  );
  const setOnLocalChange = useSetAtom(onLocalChangeAtom);

  const [filters, setFilters] = useState<ProductFilterState>({});

  const [vatPercent, setVatPercent] = useState(0);
  const [vatPercentDraft, setVatPercentDraft] = useState<string | null>(null);
  const {
    total,
    unUsedTotal,
    bothTotal,
    tax,
    discount,
    updateTotal,
    calculatePerProductAmount,
  } = useProductCalculations(localProductsData);
  const { editDeals } = useDealsEdit();
  const [showAdvancedView, setShowAdvancedView] = useState(false);

  const currentUser = useAtomValue(currentUserState);
  const configs = currentUser?.configs || {};
  const currencies = configs?.dealCurrency || [];

  products.forEach((product) => {
    productByIdRef.current[product._id] = product;
  });
  localProductsData.forEach((data) => {
    if (data.product?._id) {
      productByIdRef.current[data.product._id] = data.product;
    }
  });

  const availableProducts = Object.values(productByIdRef.current);

  const filteredProducts = filterProducts(availableProducts, filters);
  const { toast } = useToast();
  const { t } = useTranslation('sales');

  const productRecords = localProductsData
    .map((data) => {
      const product =
        data.product ||
        (data.productId ? productByIdRef.current[data.productId] : undefined);

      return {
        ...data,
        product,
      };
    })
    .filter((record) => {
      if (!record.product) return false;
      return filteredProducts.some((p) => p._id === record.product?._id);
    });

  const sortByStableProductOrder = useCallback((data: IProductData[]) => {
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

  const updateLocalProduct = useCallback(
    (id: string, patch: Partial<IProductData>) => {
      pendingProductPatchesRef.current[id] = {
        ...(pendingProductPatchesRef.current[id] || {}),
        ...patch,
      };

      setLocalProductsData((prev) => {
        const updated = prev.map((p) =>
          p._id === id ? { ...p, ...patch } : p,
        );

        updateTotal(updated);
        return updated;
      });
    },
    [updateTotal],
  );

  useEffect(() => {
    setLocalProductsData((prev) => {
      const hasPendingPatches =
        Object.keys(pendingProductPatchesRef.current).length > 0;
      const incomingProductsData = productsData || [];
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
  }, [productsData, sortByStableProductOrder]);

  useEffect(() => {
    setOnLocalChange(() => updateLocalProduct);
    return () => setOnLocalChange(null);
  }, [setOnLocalChange, updateLocalProduct]);

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

  const onProductBulkSave = (selectedProducts: IProduct[]) => {
    if (!selectedProducts?.length) return;
    const currency =
      currencies && currencies.length > 0 ? currencies[0] : 'MNT';

    const docs: IProductData[] = [];
    for (const product of selectedProducts) {
      const productData = {
        tax: 0,
        taxPercent: tax[currency] ? tax[currency].percent || 0 : 0,
        discount: 0,
        vatPercent: 0,
        discountPercent: discount[currency]
          ? discount[currency].percent || 0
          : 0,
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
        _id: Math.random().toString(),
      };
      docs.push(productData);
    }

    const processId = Math.random().toString();
    localStorage.setItem('processId', processId);

    docs.forEach((p) => calculatePerProductAmount('discount', p));

    const previousProductsData = localProductsData;
    const nextProductsData = [...previousProductsData, ...docs];

    setLocalProductsData(nextProductsData);
    updateTotal(nextProductsData);

    void createDealsProductData({
      variables: {
        processId,
        dealId,
        docs,
      },
    }).catch(() => {
      setLocalProductsData(previousProductsData);
      updateTotal(previousProductsData);
    });
  };

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
      });
    }
    const formattedProductsData = localProductsData.map((data) => ({
      ...data,
      productId: data.product?._id || data.productId,
    }));

    editDeals({
      variables: {
        productsData: formattedProductsData,
        processId: processId,
        _id: dealId,
      },
    });
  };

  const hasProductFilters = Object.values(filters).some((value) =>
    Array.isArray(value) ? value.length > 0 : Boolean(value),
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <Filter id="product-filter">
        <div className="shrink-0 border-b pb-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative w-full max-w-2xl flex-1">
              <IconSearch
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={16}
              />
              <Input
                placeholder={t('search')}
                className="w-full pl-9"
                value={filters.productSearch || ''}
                onChange={(event) =>
                  setFilters({
                    ...filters,
                    productSearch: event.target.value,
                  })
                }
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="product-vat-percent"
                  className="whitespace-nowrap text-xs font-medium text-muted-foreground"
                >
                  {t('vat-percent')}
                </Label>
                <Input
                  id="product-vat-percent"
                  type="number"
                  min={0}
                  max={100}
                  step="any"
                  className="h-9 w-20 px-2 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  value={vatPercentDraft ?? vatPercent}
                  onChange={(event) => {
                    const inputValue = event.target.value;

                    if (inputValue === '') {
                      setVatPercentDraft('');
                      setVatPercent(0);
                      return;
                    }

                    const parsedValue = Number.parseFloat(inputValue);

                    if (
                      Number.isNaN(parsedValue) ||
                      parsedValue < 0 ||
                      parsedValue > 100
                    ) {
                      return;
                    }

                    setVatPercentDraft(inputValue);
                    setVatPercent(parsedValue);
                  }}
                  onBlur={() => setVatPercentDraft(null)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9"
                  onClick={applyVat}
                >
                  {t('apply-vat')}
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-2 flex min-h-9 items-center gap-2 overflow-x-auto">
            <FilterButton filters={filters} onFilterChange={setFilters} />
            <ProductFilterBar filters={filters} onChange={setFilters} />{' '}
            <div className="flex h-9 items-center gap-2">
              <Switch
                id="product-advanced-view"
                checked={showAdvancedView}
                onCheckedChange={setShowAdvancedView}
              />
              <Label
                htmlFor="product-advanced-view"
                className="whitespace-nowrap text-xs font-medium"
              >
                {t('advanced-view')}
              </Label>
            </div>
          </div>
        </div>
      </Filter>

      <div className="min-h-0 flex-1 py-4">
        <ProductsRecordTable
          products={productRecords}
          refetch={refetch}
          dealId={dealId}
          showAdvancedView={showAdvancedView}
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
        productsData={localProductsData}
        onChangeProductsData={setLocalProductsData}
        updateTotal={updateTotal}
        onAddProducts={onProductBulkSave}
        onSave={handleSave}
      />
    </div>
  );
};
