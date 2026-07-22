'use client';

import { IProduct, IProductData } from 'ui-modules';

import { IDeal } from '@/deals/types/deals';
import { ProductsList } from './ProductsList';
import { ProductsPayment } from './ProductPayment';
import { Tabs } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const Products = ({
  deal,
  refetch,
}: {
  deal: IDeal;
  refetch: () => void;
}) => {
  const [activeTab, setActiveTab] = useState<string>('product');
  const { t } = useTranslation('sales');

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex h-full min-h-0 flex-col"
      >
        <Tabs.List variant="segment" className="shrink-0">
          <Tabs.Trigger value="product">{t('products')}</Tabs.Trigger>
          <Tabs.Trigger value="payment">{t('payments')}</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="product" className="mt-4 min-h-0 flex-1">
          <ProductsList
            products={deal.products || ([] as IProduct[])}
            productsData={deal.productsData || ([] as IProductData[])}
            dealId={deal._id}
            refetch={refetch}
            tickUsed={deal.stage?.defaultTick === false ? false : true}
          />
        </Tabs.Content>
        <Tabs.Content
          value="payment"
          className="mt-4 min-h-0 flex-1 overflow-y-auto"
        >
          <ProductsPayment deal={deal} />
        </Tabs.Content>
      </Tabs>
    </div>
  );
};
