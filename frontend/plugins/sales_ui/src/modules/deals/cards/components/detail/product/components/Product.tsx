'use client';
import { useDealsCreateProductsData } from '../hooks/useDealsCreateProductsData';
import { useState } from 'react';
import ProductTabs from './Tabs';
import { Input, Button, Sheet } from 'erxes-ui';
import { IconSearch, IconFilter, IconPlus } from '@tabler/icons-react';
import ToggleButton from './ToggleButton';
import { ProductsRecordTable } from './ProductRecordTable';
import FilterButton from './FilterButton';
import { AddProductForm } from 'ui-modules/modules';
import { productsQueries } from '../graphql/mutations/ProductQueries';
import { ProductAddSheet } from './ProductAddSheet';
import { SelectProductsBulk } from './SelectProductsBulk';
import { useDealsEdit } from '~/modules/deals/cards/hooks/useDeals';
import { useAtomValue } from 'jotai';
import { useQueryState } from 'erxes-ui';
const Product = () => {
  const [activeTab, setActiveTab] = useState<'product' | 'payment'>('product');
  const [open, setOpen] = useState<boolean>(false);
  const { createDealsProductData } = useDealsCreateProductsData();
  const { editDeals } = useDealsEdit();
  const [dealId] = useQueryState('salesItemId');
  return (
    <div className="mt-3 ml-3">
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <ProductTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {activeTab === 'product' && (
        <div>
          <div className=" flex">
            <Input placeholder="Vat percent" className="w-[40%]" />
            <Button className="ml-3">Apply VAT</Button>
          </div>
          <div className="w-full mt-3 flex items-center justify-between">
            <div className="relative w-[45%]">
              <IconSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <Input placeholder="Search" className="pl-9 w-full" />
            </div>
            <div className="flex items-center gap-6">
              <ToggleButton />
              <FilterButton />
            </div>
          </div>
          <ProductsRecordTable />
          <div className="flex justify-end mt-2 mb-5 mr-5">
            <ProductAddSheet />
            <SelectProductsBulk
              productIds={[]}
              onSave={(products) => {
                if (!products) return;
                createDealsProductData({
                  variables: {
                    dealId,
                    docs: products.map((p) => ({ product: p })),
                  },
                });
              }}
            >
              <Button variant="secondary" className="bg-border">
                <IconPlus />
                Add Many Products
              </Button>
            </SelectProductsBulk>
          </div>
        </div>
      )}

      {activeTab === 'payment' && (
        <div className="mt-3 ml-3">
          <h2>Payments content here…</h2>
        </div>
      )}
    </div>
  );
};

export default Product;
