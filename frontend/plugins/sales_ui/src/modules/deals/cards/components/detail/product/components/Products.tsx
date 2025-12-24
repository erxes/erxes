'use client';

import { IProduct, IProductData } from 'ui-modules';

import { IDeal } from '@/deals/types/deals';
import ProductsList from './ProductsList';
import ProductsPayment from './ProductPayment';
import { Tabs } from 'erxes-ui';
import { useState } from 'react';

const Products = ({ deal, refetch }: { deal: IDeal; refetch: () => void }) => {
  const [activeTab, setActiveTab] = useState<string>('product');

  return (
    <div className="mt-3 ml-3">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)}>
        <Tabs.List className="bg-accent rounded-md mb-4 w-fit px-1 border-none !no-underline">
          <Tabs.Trigger
            className="w-20 cursor-pointer font-normal data-[state=active]:bg-background data-[state=active]:shadow after:content-none after:border-none after:shadow-none after:bg-transparent"
            value="product"
          >
            Products
          </Tabs.Trigger>

          <Tabs.Trigger
            className="w-20 cursor-pointer font-normal data-[state=active]:bg-background data-[state=active]:shadow after:content-none after:border-none after:shadow-none after:bg-transparent"
            value="payment"
          >
            Payments
          </Tabs.Trigger>
        </Tabs.List>
      </Tabs>

      {activeTab === 'product' && (
        <ProductsList
          products={deal.products || ([] as IProduct[])}
          productsData={deal.productsData || ([] as IProductData[])}
          dealId={deal._id}
          refetch={refetch}
          tickUsed={deal.stage?.defaultTick === false ? false : true}
        />
      )}

      {activeTab === 'payment' && (
        <div className="mt-3 ml-3">
          <ProductsPayment deal={deal} refetch={refetch} />
        </div>
      )}
    </div>
  );
};

export default Products;
