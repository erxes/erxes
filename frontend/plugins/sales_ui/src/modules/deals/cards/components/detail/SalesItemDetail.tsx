'use client';

import { Resizable, Sheet, cn, useQueryState } from 'erxes-ui';
import {
  SalesDetailLeftSidebar,
  SalesDetailTabContent,
} from '@/deals/cards/components/detail/SalesDetailLeftSidebar';
import { useEffect, useState } from 'react';

import { DealsProvider } from '@/deals/context/DealContext';
import { IDeal } from '@/deals/types/deals';
import Overview from '@/deals/cards/components/detail/overview/Overview';
import Products from '@/deals/cards/components/detail/product/components/Products';
import { SalesDetailActions } from '@/deals/cards/components/detail/SalesDetailActions';
import { SalesItemDetailHeader } from '@/deals/cards/components/detail/SalesItemDetailHeader';
import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';
import { useAtom } from 'jotai';
import { useDealDetail } from '@/deals/cards/hooks/useDeals';

export const SalesItemDetail = () => {
  const [activeDealId, setActiveDealId] = useAtom(dealDetailSheetState);
  const [salesItemId, setSalesItemId] = useQueryState<string>('salesItemId');
  const { deal, loading, refetch } = useDealDetail();

  const [isOpen, setIsOpen] = useState(
    (!!activeDealId || !!salesItemId) && !loading,
  );

  useEffect(() => {
    setIsOpen((!!activeDealId || !!salesItemId) && !loading);
  }, [activeDealId, salesItemId, loading]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setActiveDealId(null);
      setSalesItemId(null);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <DealsProvider>
        <Sheet.View
          className={cn(
            'p-0 md:w-[calc(100vw-theme(spacing.4))] flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none sm:max-w-screen-2xl',
          )}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <SalesItemDetailHeader deal={deal || ({} as IDeal)} />
          <Sheet.Content className="overflow-hidden">
            <div className="flex h-full flex-auto overflow-hidden">
              <div className="flex flex-col flex-auto min-h-full overflow-hidden">
                <Resizable.PanelGroup
                  direction="horizontal"
                  className="flex-auto h-full overflow-hidden"
                >
                  <Resizable.Panel>
                    <SalesDetailLeftSidebar>
                      <SalesDetailTabContent value="overview">
                        <Overview deal={deal || ({} as IDeal)} />
                      </SalesDetailTabContent>
                      <SalesDetailTabContent value="products">
                        <Products
                          deal={deal || ({} as IDeal)}
                          refetch={refetch}
                        />
                      </SalesDetailTabContent>
                    </SalesDetailLeftSidebar>
                  </Resizable.Panel>
                  <SalesDetailActions />
                </Resizable.PanelGroup>
              </div>
            </div>
          </Sheet.Content>
        </Sheet.View>
      </DealsProvider>
    </Sheet>
  );
};
