import { Button, HoverCard, useQueryState } from 'erxes-ui';
import { IStatItem } from '@/task/hooks/useTasksStats';
import { ProgressDot } from '@/task/components/detail/TasksProgress';
import { cn } from 'erxes-ui';
import { IconFolder } from '@tabler/icons-react';

interface TasksProgressByProjectProps {
  stats: IStatItem[];
}

export const TasksProgressByProject = ({
  stats,
}: TasksProgressByProjectProps) => {
  const [project, setProject] = useQueryState<string>('project');

  const handleClick = (itemId: string) => {
    if (project === itemId) {
      setProject(null);
    } else {
      setProject(itemId);
    }
  };

  if (stats.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
        No project data available
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {stats.map((item) => (
        <HoverCard openDelay={150} closeDelay={150} key={item.id}>
          <HoverCard.Trigger asChild>
            <Button
              className={cn(
                'flex justify-start gap-2 items-center text-sm font-normal h-10 py-1 w-full',
                project === item.id && 'bg-accent',
              )}
              variant="ghost"
              size="lg"
              onClick={() => handleClick(item.id)}
            >
              <div className="flex items-center justify-between w-full">
                <IconFolder className="size-4 text-muted-foreground" />
                <span className="font-medium truncate flex-1 text-left">
                  {item.name}
                </span>
                <span className="text-sm text-accent-foreground whitespace-nowrap">
                  {item.totalTasks}
                </span>
              </div>
            </Button>
          </HoverCard.Trigger>
          <HoverCard.Content side="left" className="w-32 p-3">
            <div className="flex flex-col gap-1 text-muted-foreground">
              <p className="text-sm flex items-center gap-1">
                <ProgressDot status="total" />
                total:
                <span className="text-foreground ml-auto">
                  {item.totalTasks}
                </span>
              </p>
              <p className="text-sm flex items-center gap-1 ">
                <ProgressDot status="completed" />
                completed:
                <span className="text-foreground ml-auto">
                  {item.completedTasks}
                </span>
              </p>
              <p className="text-sm flex items-center gap-1 ">
                <ProgressDot status="started" />
                started:
                <span className="text-foreground ml-auto">
                  {item.startedTasks}
                </span>
              </p>
            </div>
          </HoverCard.Content>
        </HoverCard>
      ))}
    </div>
  );
};
