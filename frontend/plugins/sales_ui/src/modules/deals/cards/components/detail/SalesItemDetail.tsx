'use client';

import { Resizable, Sheet, cn } from 'erxes-ui';
import {
  SalesDetailLeftSidebar,
  SalesDetailTabContent,
} from './SalesDetailLeftSidebar';
import { useEffect, useState } from 'react';

import { DealsProvider } from '@/deals/context/DealContext';
import { IDeal } from '@/deals/types/deals';
import Overview from './overview/Overview';
import { SalesDetailActions } from './SalesDetailActions';
import { SalesItemDetailHeader } from './SalesItemDetailHeader';
import { useDealDetail } from '@/deals/cards/hooks/useDeals';
import { useDealDetailSheetQueryParam } from '@/deals/states/dealDetailSheetState';

export const SalesItemDetail = () => {
  const [activeDealId, setActiveDealId] = useDealDetailSheetQueryParam();

  const { deal, loading } = useDealDetail();

  const [isOpen, setIsOpen] = useState(!!activeDealId && !loading);

  useEffect(() => {
    setIsOpen(!!activeDealId && !loading);
  }, [activeDealId, loading]);

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) setActiveDealId(null);
      }}
    >
      <DealsProvider>
        <Sheet.View
          className={cn(
            'p-0 md:w-[calc(100vw-theme(spacing.4))] flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none sm:max-w-screen-2xl',
          )}
          onEscapeKeyDown={(e) => {
            e.preventDefault();
          }}
        >
          <SalesItemDetailHeader deal={deal || ({} as IDeal)} />
          <Sheet.Content className="overflow-hidden">
            <div className="flex h-full flex-auto overflow-hidden">
              <div className="flex flex-col flex-auto min-h-full overflow-hidden">
                <Resizable.PanelGroup
                  direction="horizontal"
                  className="flex-auto min-h-full overflow-hidden"
                >
                  <Resizable.Panel>
                    <SalesDetailLeftSidebar>
                      <SalesDetailTabContent value="overview">
                        <Overview deal={deal || ({} as IDeal)} />
                      </SalesDetailTabContent>
                      <SalesDetailTabContent value="plugins">
                        Custom Plugins
                      </SalesDetailTabContent>
                      <SalesDetailTabContent value="properties">
                        Custom properties
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
