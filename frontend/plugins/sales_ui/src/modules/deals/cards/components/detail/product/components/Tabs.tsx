'use client';

import React from 'react';
import { Tabs } from 'erxes-ui';

interface Props {
  activeTab: 'product' | 'payment';
  setActiveTab: (value: 'product' | 'payment') => void;
}

const ProductTabs = ({ activeTab, setActiveTab }: Props) => {
  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
      <Tabs.List className="bg-accent rounded border-b-none px-1 border-none !no-underline">
        <Tabs.Trigger
          className="w-20 font-normal data-[state=active]:bg-background data-[state=active]:shadow after:content-none after:border-none after:shadow-none after:bg-transparent"
          value="product"
        >
          Products
        </Tabs.Trigger>

        <Tabs.Trigger
          className="w-20 font-normal data-[state=active]:bg-background data-[state=active]:shadow after:content-none after:border-none after:shadow-none after:bg-transparent"
          value="payment"
        >
          Payments
        </Tabs.Trigger>
      </Tabs.List>
    </Tabs>
  );
};

export default ProductTabs;
