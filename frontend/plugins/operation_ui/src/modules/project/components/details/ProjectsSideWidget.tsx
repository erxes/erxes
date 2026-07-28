import { Progress } from '@/project/components/details/Progress';
import { ProgressByMember } from '@/project/components/details/ProgressByMember';
import { ProgressByTeam } from '@/project/components/details/ProgressByTeam';
import { ProgressChart } from '@/project/components/details/ProgressChart';
import ProjectMilestone from '@/project/components/details/ProjectMilestone';
import { IconCaretRightFilled, IconChartHistogram } from '@tabler/icons-react';
import {
  Button,
  Collapsible,
  ScrollArea,
  Separator,
  SideMenu,
  Tabs,
  ToggleGroup,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export enum ProjectsSideWidgetTabsEnum {
  Assignees = 'assignees',
  Teams = 'teams',
  Milestones = 'milestones',
}

export const ProjectsSideWidget = ({ projectId }: { projectId: string }) => {
  const { t } = useTranslation('operation');
  return (
    <SideMenu defaultValue="project">
      <SideMenu.Content value="project">
        <SideMenu.Header Icon={IconChartHistogram} label={t('project-report')} />
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
                  {t('progress')}
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
            <Tabs.Content value={ProjectsSideWidgetTabsEnum.Milestones}>
              <ProjectMilestone projectId={projectId} />
            </Tabs.Content>
          </ProjectsSideWidgetTabs>
        </>
      </SideMenu.Content>
      <SideMenu.Sidebar>
        <SideMenu.Trigger
          value="project"
          label={t('project-report')}
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
  const { t } = useTranslation('operation');
  const [value, setValue] = useState<ProjectsSideWidgetTabsEnum>(
    ProjectsSideWidgetTabsEnum.Assignees,
  );
  return (
    <>
      <div className="p-4 space-y-3 overflow-hidden flex-auto flex flex-col">
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
            {t('assignees')}
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value={ProjectsSideWidgetTabsEnum.Teams}
            className="flex-auto"
          >
            {t('teams')}
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value={ProjectsSideWidgetTabsEnum.Milestones}
            className="flex-auto"
          >
            {t('milestones')}
          </ToggleGroup.Item>
        </ToggleGroup>
        <Tabs
          value={value}
          defaultValue={ProjectsSideWidgetTabsEnum.Teams}
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
