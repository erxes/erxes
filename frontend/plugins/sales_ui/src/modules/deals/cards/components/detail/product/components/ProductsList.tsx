import { Button, Filter, Input, Label, Switch, useToast } from 'erxes-ui';
import { FilterButton, ProductFilterBar, filterProducts } from './FilterButton';
import { IProduct, IProductData, currentUserState } from 'ui-modules';
import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect, useRef, useState } from 'react';

import { IconSearch } from '@tabler/icons-react';
import { ProductFilterState } from '@/deals/actionBar/types/actionBarTypes';
import ProductFooter from './ProductFooter';
import { ProductsRecordTable } from './ProductRecordTable';
import { onLocalChangeAtom } from '../productTableAtom';
import { useDealsCreateProductsData } from '../hooks/useDealsCreateProductsData';
import { useDealsEdit } from '@/deals/cards/hooks/useDeals';
import { useProductCalculations } from '../hooks/useProductCalculations';

const ProductsList = ({
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

  const [filters, setFilters] = useState<ProductFilterState>(
    {} as ProductFilterState,
  );

  const [vatPercent, setVatPercent] = useState(0);
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

  const updateLocalProduct = (id: string, patch: Partial<IProductData>) => {
    pendingProductPatchesRef.current[id] = {
      ...(pendingProductPatchesRef.current[id] || {}),
      ...patch,
    };

    setLocalProductsData((prev) => {
      const updated = prev.map((p) => (p._id === id ? { ...p, ...patch } : p));

      updateTotal(updated);
      return updated;
    });
  };

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

        if (pendingPatch) {
          const hasServerCaughtUp = Object.entries(pendingPatch).every(
            ([key, value]) =>
              Object.is(data[key as keyof IProductData], value),
          );

          if (hasServerCaughtUp) {
            delete pendingProductPatchesRef.current[data._id];
          }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setOnLocalChange]);

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

  const onPoductBulkSave = (selectedProducts: IProduct[]) => {
    if (!selectedProducts?.length) return;
    const currency =
      currencies && currencies.length > 0 ? currencies[0] : 'MNT';

    const docs: any[] = [];
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
        title: 'Error',
        description: `Please assign a team member to the following service item(s) before saving: ${names}.`,
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

  return (
    <div className="space-y-4">
      <Filter id="product-filter">
        <div className="flex items-center gap-4 flex-wrap">
          <Input
            placeholder="Vat percent"
            className="w-[40%]"
            value={vatPercent}
            onChange={(e) => setVatPercent(Number.parseInt(e.target.value))}
          />
          <Button className="ml-3" onClick={() => applyVat()}>
            Apply VAT
          </Button>
        </div>
        <div className="w-full mt-3 flex items-center justify-between">
          <div className="relative w-[45%]">
            <IconSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <Input
              placeholder="Search"
              className="pl-9 w-full"
              value={filters.productSearch || ''}
              onChange={(e) =>
                setFilters({ ...filters, productSearch: e.target.value })
              }
            />
          </div>
          <div className="flex items-center gap-6">
            <div>
              <Label className="mr-3">Advanced view</Label>
              <Switch
                checked={showAdvancedView}
                onCheckedChange={(checked) => {
                  setShowAdvancedView(checked);
                }}
              />
            </div>
            <FilterButton filters={filters} onFilterChange={setFilters} />
          </div>
        </div>
        <div className="flex-1 flex items-center gap-2 overflow-x-auto py-1">
          <ProductFilterBar filters={filters} onChange={setFilters} />
        </div>
      </Filter>
        <ProductsRecordTable
          products={productRecords || ([] as IProductData[])}
          refetch={refetch}
          dealId={dealId}
          showAdvancedView={showAdvancedView}
          onLocalChange={updateLocalProduct}
        />
      <ProductFooter
        productsCount={localProductsData.length || 0}
        total={total}
        unUsedTotal={unUsedTotal}
        bothTotal={bothTotal}
        discount={discount}
        tax={tax}
        showAdvancedView={showAdvancedView}
        productsData={localProductsData}
        onChangeProductsData={setLocalProductsData}
        updateTotal={updateTotal}
        onAddProducts={onPoductBulkSave}
        onSave={handleSave}
      />
    </div>
  );
};

export default ProductsList;
