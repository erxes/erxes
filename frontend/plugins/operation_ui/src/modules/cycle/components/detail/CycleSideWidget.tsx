import { IconCaretRightFilled, IconChartHistogram } from '@tabler/icons-react';
import {
  Button,
  SideMenu,
  Collapsible,
  Separator,
  ToggleGroup,
  Tabs,
  ScrollArea,
} from 'erxes-ui';
import { CycleProgressChart } from '@/cycle/components/detail/CycleProgressChart';
import { CycleProgress } from '@/cycle/components/detail/CycleProgress';
import { CycleProgressByMember } from '@/cycle/components/detail/CycleProgressByMember';
import { CycleProgressByProject } from '@/cycle/components/detail/CycleProgressByProject';
import { useState } from 'react';
import { useGetCycle } from '@/cycle/hooks/useGetCycle';

export enum CycleSideWidgetTabsEnum {
  Assignees = 'assignees',
  Projects = 'projects',
}

export const CycleSideWidget = ({ cycleId }: { cycleId: string }) => {
  const { cycleDetail, loading } = useGetCycle(cycleId);

  const statistics = cycleDetail?.statistics || {};
  const isCompleted = cycleDetail?.isCompleted || false;

  if (loading) {
    return null;
  }

  return (
    <SideMenu defaultValue="cycle">
      <SideMenu.Content value="cycle">
        <SideMenu.Header Icon={IconChartHistogram} label="Cycle Report" />
        <>
          <div className="p-4 border-b">
            <Collapsible className="group/collapsible-menu" defaultOpen>
              <Collapsible.Trigger asChild>
                <Button
                  variant="secondary"
                  className="w-min text-accent-foreground justify-start text-left"
                  size="sm"
                >
                  <IconCaretRightFilled className="transition-transform group-data-[state=open]/collapsible-menu:rotate-90" />
                  Progress
                </Button>
              </Collapsible.Trigger>
              <Collapsible.Content>
                <CycleProgress
                  cycleId={cycleId}
                  isCompleted={isCompleted}
                  statistics={statistics}
                />
                <CycleProgressChart
                  cycleId={cycleId}
                  isCompleted={isCompleted}
                  statistics={statistics}
                />
              </Collapsible.Content>
            </Collapsible>
          </div>
          <CycleSideWidgetTabs>
            <Tabs.Content value={CycleSideWidgetTabsEnum.Assignees}>
              <CycleProgressByMember
                cycleId={cycleId}
                isCompleted={isCompleted}
                statistics={statistics}
              />
            </Tabs.Content>
            <Tabs.Content value={CycleSideWidgetTabsEnum.Projects}>
              <CycleProgressByProject
                cycleId={cycleId}
                isCompleted={isCompleted}
                statistics={statistics}
              />
            </Tabs.Content>
          </CycleSideWidgetTabs>
        </>
      </SideMenu.Content>
      <SideMenu.Sidebar>
        <SideMenu.Trigger
          value="cycle"
          label="Cycle Report"
          Icon={IconChartHistogram}
        />
      </SideMenu.Sidebar>
    </SideMenu>
  );
};

export const CycleSideWidgetTabs = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [value, setValue] = useState<CycleSideWidgetTabsEnum>(
    CycleSideWidgetTabsEnum.Assignees,
  );
  return (
    <>
      <div className="p-4 space-y-3 overflow-hidden flex-auto flex flex-col">
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          defaultValue={CycleSideWidgetTabsEnum.Assignees}
          value={value}
          onValueChange={(value) => {
            if (!value) {
              return null;
            }
            setValue(value as CycleSideWidgetTabsEnum);
          }}
        >
          <ToggleGroup.Item
            value={CycleSideWidgetTabsEnum.Assignees}
            className="flex-auto"
          >
            Assignees
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value={CycleSideWidgetTabsEnum.Projects}
            className="flex-auto"
          >
            Projects
          </ToggleGroup.Item>
        </ToggleGroup>
        <Tabs
          value={value}
          defaultValue={CycleSideWidgetTabsEnum.Projects}
          className="overflow-auto flex-auto"
          asChild
        >
          <ScrollArea>{children}</ScrollArea>
        </Tabs>
      </div>
      <Separator />
    </>
  );
};
