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
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { TasksProgress } from '@/task/components/detail/TasksProgress';
import { TasksProgressChart } from '@/task/components/detail/TasksProgressChart';
import { TasksProgressByPriority } from '@/task/components/detail/TasksProgressByPriority';
import { TasksProgressByProject } from '@/task/components/detail/TasksProgressByProject';
import { TasksProgressByTag } from '@/task/components/detail/TasksProgressByTag';
import { useTasksStats } from '@/task/hooks/useTasksStats';

export enum TasksSideWidgetTabsEnum {
  Priorities = 'priorities',
  Projects = 'projects',
  Tags = 'tags',
}

interface TasksSideWidgetProps {
  userId?: string;
  children?: React.ReactNode;
}

export const TasksSideWidget = ({ userId, children }: TasksSideWidgetProps) => {
  const { teamId } = useParams();

  const {
    tasks,
    loading,
    totalTasks,
    startedTasks,
    completedTasks,
    priorityStats,
    projectStats,
    tagStats,
  } = useTasksStats({
    teamId,
    userId,
  });

  if (loading && tasks.length === 0) {
    return null;
  }

  return (
    <SideMenu defaultValue="">
      {children}
      <SideMenu.Content value="task-report">
        <SideMenu.Header Icon={IconChartHistogram} label="Task Report" />
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
                <TasksProgress
                  totalTasks={totalTasks}
                  startedTasks={startedTasks}
                  completedTasks={completedTasks}
                />
                <TasksProgressChart tasks={tasks} />
              </Collapsible.Content>
            </Collapsible>
          </div>
          <TasksSideWidgetTabs>
            <Tabs.Content value={TasksSideWidgetTabsEnum.Priorities}>
              <TasksProgressByPriority stats={priorityStats} />
            </Tabs.Content>
            <Tabs.Content value={TasksSideWidgetTabsEnum.Projects}>
              <TasksProgressByProject stats={projectStats} />
            </Tabs.Content>
            <Tabs.Content value={TasksSideWidgetTabsEnum.Tags}>
              <TasksProgressByTag stats={tagStats} />
            </Tabs.Content>
          </TasksSideWidgetTabs>
        </>
      </SideMenu.Content>
      <SideMenu.Sidebar>
        <SideMenu.Trigger
          value="task-report"
          label="Task Report"
          Icon={IconChartHistogram}
        />
      </SideMenu.Sidebar>
    </SideMenu>
  );
};

export const TasksSideWidgetTabs = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [value, setValue] = useState<TasksSideWidgetTabsEnum>(
    TasksSideWidgetTabsEnum.Priorities,
  );
  return (
    <>
      <div className="p-4 space-y-3 overflow-hidden flex-auto flex flex-col">
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          defaultValue={TasksSideWidgetTabsEnum.Priorities}
          value={value}
          onValueChange={(value) => {
            if (!value) {
              return null;
            }
            setValue(value as TasksSideWidgetTabsEnum);
          }}
        >
          <ToggleGroup.Item
            value={TasksSideWidgetTabsEnum.Priorities}
            className="flex-auto"
          >
            Priorities
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value={TasksSideWidgetTabsEnum.Projects}
            className="flex-auto"
          >
            Projects
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value={TasksSideWidgetTabsEnum.Tags}
            className="flex-auto"
          >
            Tags
          </ToggleGroup.Item>
        </ToggleGroup>
        <Tabs
          value={value}
          defaultValue={TasksSideWidgetTabsEnum.Priorities}
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
