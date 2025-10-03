import { Resizable, Sheet, cn, useQueryState } from 'erxes-ui';
import {
  SalesDetailLeftSidebar,
  SalesDetailTabContent,
} from './SalesDetailLeftSidebar';

import { IDeal } from '@/deals/types/deals';
import Overview from './overview/Overview';
import { SalesDetailActions } from './SalesDetailActions';
import { SalesItemDetailHeader } from './SalesItemDetailHeader';
import { useDealDetail } from '@/deals/cards/hooks/useDeals';

export const SalesItemDetail = () => {
  const [open, setOpen] = useQueryState<string>('salesItemId');

  const { deal, loading } = useDealDetail();

  return (
    <Sheet open={!!open && !loading} onOpenChange={() => setOpen(null)}>
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
    </Sheet>
  );
};
