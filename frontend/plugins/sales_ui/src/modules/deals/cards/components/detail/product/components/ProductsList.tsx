import { Button, Filter, Input, Label, Switch } from 'erxes-ui';
import { FilterButton, ProductFilterBar, filterProducts } from './FilterButton';
import { IProduct, IProductData, currentUserState } from 'ui-modules';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';

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

  const filteredProducts = filterProducts(products, filters);

  const productRecords = localProductsData
    .map((data) => ({
      ...data,
      product: products.find((p) => p._id === data.productId),
    }))
    .filter((record) => {
      if (!record.product) return false;
      return filteredProducts.some((p) => p._id === record.product?._id);
    });

  const updateLocalProduct = (id: string, patch: Partial<IProductData>) => {
    setLocalProductsData((prev) => {
      const updated = prev.map((p) => (p._id === id ? { ...p, ...patch } : p));

      updateTotal(updated);
      return updated;
    });
  };

  useEffect(() => {
    setLocalProductsData(productsData);
  }, [productsData]);

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
    if (!selectedProducts) return;
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

    updateTotal(docs);

    createDealsProductData({
      variables: {
        processId,
        dealId,
        docs,
      },
    });
  };

  const handleSave = () => {
    const processId = localStorage.getItem('processId') || '';

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
    <div className="space-y-4 md:w-3/5">
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
        productsCount={products?.length || 0}
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
