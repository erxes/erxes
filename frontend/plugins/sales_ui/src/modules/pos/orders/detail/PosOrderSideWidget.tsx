import { IconCaretRightFilled, IconChartHistogram } from '@tabler/icons-react';
import { Button, SideMenu, Collapsible } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { PosOrderSummary } from './PosOrderSummary';
import { usePosOrdersSummary } from './hooks/usePosOrdersSummary';

interface PosOrderSideWidgetProps {
  children?: React.ReactNode;
}

export const PosOrderSideWidget = ({ children }: PosOrderSideWidgetProps) => {
  const { posId } = useParams();

  const { posOrdersSummary, loading } = usePosOrdersSummary({ posId });

  const summaryData =
    posOrdersSummary && Object.keys(posOrdersSummary).length > 0
      ? posOrdersSummary
      : {};

  if (loading && !posOrdersSummary) {
    return null;
  }

  return (
    <SideMenu defaultValue="">
      {children}
      <SideMenu.Content value="pos-order-summary">
        <SideMenu.Header Icon={IconChartHistogram} label="Pos order Summary" />

        <div className="p-4 border-b">
          <Collapsible className="group/collapsible-menu" defaultOpen>
            <Collapsible.Trigger asChild>
              <Button
                variant="secondary"
                className="w-min text-accent-foreground justify-start text-left"
                size="sm"
              >
                <IconCaretRightFilled className="transition-transform group-data-[state=open]/collapsible-menu:rotate-90" />
                Summary
              </Button>
            </Collapsible.Trigger>
            <Collapsible.Content>
              <PosOrderSummary summary={summaryData} />
            </Collapsible.Content>
          </Collapsible>
        </div>
      </SideMenu.Content>
      <SideMenu.Sidebar>
        <SideMenu.Trigger
          value="pos-order-summary"
          label="Pos order Summary"
          Icon={IconChartHistogram}
        />
      </SideMenu.Sidebar>
    </SideMenu>
  );
};
