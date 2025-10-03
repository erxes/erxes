import { IconCaretRightFilled, IconChartHistogram } from '@tabler/icons-react';
import {
  Button,
  SideMenu,
  Collapsible,
  Tabs,
  ToggleGroup,
  Separator,
} from 'erxes-ui';
import { ProgressChart } from '@/project/components/details/ProgressChart';
import { Progress } from '@/project/components/details/Progress';
import { ProgressByMember } from '@/project/components/details/ProgressByMember';
import { ProgressByTeam } from '@/project/components/details/ProgressByTeam';
import { useState } from 'react';

export enum ProjectsSideWidgetTabsEnum {
  Assignees = 'assignees',
  Teams = 'teams',
}

export const ProjectsSideWidget = ({ projectId }: { projectId: string }) => {
  return (
    <SideMenu defaultValue="project">
      <SideMenu.Content value="project">
        <SideMenu.Header Icon={IconChartHistogram} label="Project Report" />
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
                <Progress projectId={projectId} />
                <ProgressChart projectId={projectId} />
              </Collapsible.Content>
            </Collapsible>
          </div>
          <ProjectsSideWidgetTabs>
            <Tabs.Content value={ProjectsSideWidgetTabsEnum.Assignees}>
              <ProgressByMember projectId={projectId} />
            </Tabs.Content>
            <Tabs.Content value={ProjectsSideWidgetTabsEnum.Teams}>
              <ProgressByTeam projectId={projectId} />
            </Tabs.Content>
          </ProjectsSideWidgetTabs>
        </>
      </SideMenu.Content>
      <SideMenu.Sidebar>
        <SideMenu.Trigger
          value="project"
          label="Project Report"
          Icon={IconChartHistogram}
        />
      </SideMenu.Sidebar>
    </SideMenu>
  );
};

export const ProjectsSideWidgetTabs = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [value, setValue] = useState<ProjectsSideWidgetTabsEnum>(
    ProjectsSideWidgetTabsEnum.Assignees,
  );
  return (
    <>
      <div className="p-4 space-y-3">
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          defaultValue={ProjectsSideWidgetTabsEnum.Assignees}
          value={value}
          onValueChange={(value) => {
            if (!value) {
              return null;
            }
            setValue(value as ProjectsSideWidgetTabsEnum);
          }}
        >
          <ToggleGroup.Item
            value={ProjectsSideWidgetTabsEnum.Assignees}
            className="flex-auto"
          >
            Assignees
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value={ProjectsSideWidgetTabsEnum.Teams}
            className="flex-auto"
          >
            Teams
          </ToggleGroup.Item>
        </ToggleGroup>
        <Tabs value={value} defaultValue={ProjectsSideWidgetTabsEnum.Teams}>
          {children}
        </Tabs>
      </div>
      <Separator />
    </>
  );
};
