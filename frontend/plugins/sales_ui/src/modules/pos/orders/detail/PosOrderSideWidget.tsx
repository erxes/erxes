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

  const count = posOrdersSummary?.count || 0;
  const totalAmount = posOrdersSummary?.totalAmount || 0;
  const cashAmount = posOrdersSummary?.cashAmount || 0;
  const mobileAmount = posOrdersSummary?.mobileAmount || 0;
  const khaanAmount = posOrdersSummary?.khaanAmount || 0;
  const golomtCardAmount = posOrdersSummary?.golomtCardAmount || 0;
  const invoice = posOrdersSummary?.Invoice || 0;
  const undefinedAmount = posOrdersSummary?.undefinedAmount || 0;
  const barterAmount = posOrdersSummary?.barterAmount || 0;
  const skipEbarimtAmount = posOrdersSummary?.skipEbarimtAmount || 0;

  if (loading && count === 0) {
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
              <PosOrderSummary
                count={count}
                totalAmount={totalAmount}
                cashAmount={cashAmount}
                mobileAmount={mobileAmount}
                khaanAmount={khaanAmount}
                golomtCardAmount={golomtCardAmount}
                invoice={invoice}
                undefinedAmount={undefinedAmount}
                barterAmount={barterAmount}
                skipEbarimtAmount={skipEbarimtAmount}
              />
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
