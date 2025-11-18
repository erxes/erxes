'use client';

import React from 'react';
import { IDeal } from '@/deals/types/deals';
import { Tabs, Input, Button, Checkbox, Switch } from 'erxes-ui';
import { IconSearch, IconFilter } from '@tabler/icons-react';
import { useState } from 'react';

interface Props {
  deal: IDeal;
}

const Products: React.FC<Props> = ({ deal }) => {
  const products = deal.products || [];

  return (
    <div className="ml-3 mt-2">
      <div className="h-full flex flex-col">
        <Tabs defaultValue="note h-full w-full">
          <Tabs.List className="grid grid-cols-2 p-1 bg-muted mb-3 md:mb-4 rounded-lg w-[20%]">
            <Tabs.Trigger asChild value="note" className="after:hidden">
              <Button
                variant="ghost"
                className="border-0 shadow-none bg-transparent data-[state=active]:bg-background"
              >
                Products
              </Button>
            </Tabs.Trigger>

            <Tabs.Trigger asChild value="comment" className="after:hidden">
              <Button
                variant="ghost"
                className="border-0 shadow-none bg-transparent data-[state=active]:bg-background"
              >
                Payments
              </Button>
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="note">
            <div className="p-2">
              <p>Product</p>
            </div>
          </Tabs.Content>

          <Tabs.Content value="comment">
            <div className="p-2">
              <p>Payment</p>
            </div>
          </Tabs.Content>
        </Tabs>
      </div>

      <div className="flex w-[40%] gap-2">
        <Input placeholder="VAT percent" />
        <Button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary/90 items-center"
        >
          Apply VAT
        </Button>
      </div>
      <div className="relative mt-5 w-full flex justify-between items-center">
        <div className="relative w-[35%]">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search" className="pl-9 w-full" />
        </div>
        <div className="flex items-center gap-3">
          <b className="text-sm font-medium text-muted-foreground">
            Advanced View
          </b>
          <Switch />

          <button
            className="flex items-center leading-[100%] text-foreground font-inter gap-1 text-sm font-medium rounded-md p-1 hover:bg-muted focus:outline-hidden m"
            aria-label="Open action menu"
            aria-haspopup="true"
          >
            <IconFilter size={18} stroke={2} />
            Filter
          </button>
        </div>
      </div>
    </div>
  );
};

export default Products;
