'use client';

import { Resizable, Sheet, cn, useQueryState } from 'erxes-ui';
import { useEffect, useState } from 'react';

import { DealsProvider } from '@/deals/context/DealContext';
import { IDeal } from '@/deals/types/deals';
import Overview from './overview/Overview';
import { SalesDetailActions } from './SalesDetailActions';
import { SalesItemDetailHeader } from './SalesItemDetailHeader';
import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';
import { useAtom } from 'jotai';
import { useDealDetail } from '@/deals/cards/hooks/useDeals';

export const SalesItemDetail = () => {
  const [activeDealId, setActiveDealId] = useAtom(dealDetailSheetState);
  const [salesItemId, setSalesItemId] = useQueryState<string>('salesItemId');

  const { deal, loading } = useDealDetail();

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
            'p-0 md:max-w-screen-lg flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none',
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
                    <Overview deal={deal || ({} as IDeal)} />
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
