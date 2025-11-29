'use client';

import { Resizable, Sheet, cn, useQueryState, Sidebar } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { DealsProvider } from '@/deals/context/DealContext';
import { IDeal } from '@/deals/types/deals';
import Overview from './overview/Overview';
import { SalesItemDetailHeader } from './SalesItemDetailHeader';
import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';
import { useAtom } from 'jotai';
import { useDealDetail } from '@/deals/cards/hooks/useDeals';
import Product from './product/components/Product';

export const SalesItemDetail = () => {
  const [activeDealId, setActiveDealId] = useAtom(dealDetailSheetState);
  const [salesItemId, setSalesItemId] = useQueryState<string>('salesItemId');
  const { deal, loading } = useDealDetail();

  const [isOpen, setIsOpen] = useState(
    (!!activeDealId || !!salesItemId) && !loading,
  );

  const [activeTab, setActiveTab] = useState<'overview' | 'products'>(
    'overview',
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
            'p-0 flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none',
            'md:max-w-6xl md:w-full h-full rounded-xl',
          )}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <SalesItemDetailHeader deal={deal || ({} as IDeal)} />

          <Sheet.Content className="overflow-hidden p-0 h-full">
            <div className="flex h-full flex-auto overflow-hidden">
              <Resizable.PanelGroup
                direction="horizontal"
                className="flex-auto h-full overflow-hidden"
              >
                <Resizable.Panel
                  defaultSize={23}
                  minSize={18}
                  maxSize={30}
                  className="border-r bg-white overflow-y-auto"
                >
                  <Sidebar collapsible="none" className="w-full border-r-0 p-3">
                    <Sidebar.Group>
                      <Sidebar.GroupLabel className="text-xs font-semibold text-gray-500 px-2">
                        GENERAL
                      </Sidebar.GroupLabel>
                      <Sidebar.GroupContent>
                        <Sidebar.Menu>
                          <Sidebar.MenuItem>
                            <Sidebar.MenuButton
                              isActive={activeTab === 'overview'}
                              onClick={() => setActiveTab('overview')}
                            >
                              Overview
                            </Sidebar.MenuButton>
                          </Sidebar.MenuItem>
                        </Sidebar.Menu>
                      </Sidebar.GroupContent>

                      <Sidebar.GroupLabel className="text-xs font-semibold text-gray-500 mt-4 px-2">
                        TITLE
                      </Sidebar.GroupLabel>

                      <Sidebar.GroupContent>
                        <Sidebar.Menu>
                          <Sidebar.MenuItem>
                            <Sidebar.MenuButton
                              isActive={activeTab === 'products'}
                              onClick={() => setActiveTab('products')}
                            >
                              Products
                            </Sidebar.MenuButton>
                          </Sidebar.MenuItem>
                        </Sidebar.Menu>
                      </Sidebar.GroupContent>
                    </Sidebar.Group>
                  </Sidebar>
                </Resizable.Panel>

                <Resizable.Panel className="overflow-y-auto">
                  {activeTab === 'overview' && (
                    <div className="h-full overflow-y-auto">
                      <Overview deal={deal || ({} as IDeal)} />
                    </div>
                  )}

                  {activeTab === 'products' && (
                    <div className="h-full overflow-y-auto">
                      <Product />
                    </div>
                  )}
                </Resizable.Panel>
              </Resizable.PanelGroup>
            </div>
          </Sheet.Content>
        </Sheet.View>
      </DealsProvider>
    </Sheet>
  );
};
