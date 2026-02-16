'use client';

import {
  ActivityLogs,
  FieldsInDetail,
  RelationWidgetSideTabs,
} from 'ui-modules';
import { Empty, FocusSheet, ScrollArea, Tabs, useQueryState } from 'erxes-ui';
import { IconAlertCircle, IconCloudExclamation } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { DealsProvider } from '@/deals/context/DealContext';
import { IDeal } from '@/deals/types/deals';
import Overview from '@/deals/cards/components/detail/overview/Overview';
import Products from '@/deals/cards/components/detail/product/components/Products';
import { SalesItemDetailHeader } from '@/deals/cards/components/detail/SalesItemDetailHeader';
import { SalesItemSidebar } from './SalesItemSidebar';
import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';
import { useAtom } from 'jotai';
import { useDealCustomFieldEdit } from '../../hooks/useDealCustomFieldEdit';
import { useDealDetail } from '@/deals/cards/hooks/useDeals';

export const SalesItemDetail = () => {
  const [activeDealId, setActiveDealId] = useAtom(dealDetailSheetState);
  const [salesItemId, setSalesItemId] = useQueryState<string>('salesItemId');
  const [selectedTab, setSelectedTab] = useQueryState<string>('tab');
  const { deal, loading, error, refetch } = useDealDetail();

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
    <FocusSheet open={isOpen} onOpenChange={handleOpenChange}>
      <DealsProvider>
        <FocusSheet.View
          loading={loading}
          error={!!error}
          notFound={!deal}
          notFoundState={<SalesItemDetailEmptyState />}
          errorState={<SalesItemDetailErrorState />}
        >
          <SalesItemDetailHeader deal={deal || ({} as IDeal)} />
          <FocusSheet.Content>
            <FocusSheet.SideBar>
              <SalesItemSidebar />
            </FocusSheet.SideBar>
            <div className="flex-1 flex flex-col overflow-hidden">
              <ScrollArea className="h-full">
                <Tabs
                  value={selectedTab ?? 'overview'}
                  onValueChange={setSelectedTab}
                >
                  <Tabs.Content value="overview">
                    <Overview deal={deal || ({} as IDeal)} />
                  </Tabs.Content>
                  <Tabs.Content value="properties" className="p-6">
                    <FieldsInDetail
                      fieldContentType="sales:deal"
                      propertiesData={deal?.propertiesData || {}}
                      mutateHook={useDealCustomFieldEdit}
                      id={deal?._id || ''}
                    />
                  </Tabs.Content>
                  <Tabs.Content value="activityLogs">
                    <ActivityLogs targetId={deal?._id || ''} />
                  </Tabs.Content>
                  <Tabs.Content value="products" className="p-6">
                    <Products deal={deal || ({} as IDeal)} refetch={refetch} />
                  </Tabs.Content>
                </Tabs>
              </ScrollArea>
            </div>
            <RelationWidgetSideTabs
              contentId={deal?._id || ''}
              contentType="sales:deal"
              hookOptions={{
                hiddenModules: ['deals'],
              }}
            />
          </FocusSheet.Content>
        </FocusSheet.View>
      </DealsProvider>
    </FocusSheet>
  );
};

const SalesItemDetailEmptyState = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <Empty>
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconCloudExclamation />
          </Empty.Media>
          <Empty.Title>Deal not found</Empty.Title>
          <Empty.Description>
            There seems to be no deal with this ID.
          </Empty.Description>
        </Empty.Header>
      </Empty>
    </div>
  );
};

const SalesItemDetailErrorState = () => {
  const { error } = useDealDetail();

  return (
    <div className="flex items-center justify-center h-full">
      <Empty>
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconAlertCircle />
          </Empty.Media>
          <Empty.Title>Error</Empty.Title>
          <Empty.Description>{error?.message}</Empty.Description>
        </Empty.Header>
      </Empty>
    </div>
  );
};
