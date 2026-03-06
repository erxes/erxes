import { Button, HoverCard, useQueryState } from 'erxes-ui';
import { IStatItem } from '@/task/hooks/useTasksStats';
import { ProgressDot } from '@/task/components/detail/TasksProgress';
import { cn } from 'erxes-ui';

interface TasksProgressByPriorityProps {
  stats: IStatItem[];
}

const getPriorityColor = (priority: string) => {
  const priorityNum = Number(priority);
  switch (priorityNum) {
    case 4:
      return 'text-red-600';
    case 3:
      return 'text-orange-500';
    case 2:
      return 'text-yellow-500';
    case 1:
      return 'text-blue-400';
    default:
      return 'text-gray-400';
  }
};

export const TasksProgressByPriority = ({
  stats,
}: TasksProgressByPriorityProps) => {
  const [priority, setPriority] = useQueryState<string>('priority');

  const handleClick = (itemId: string) => {
    if (priority === itemId) {
      setPriority(null);
    } else {
      setPriority(itemId);
    }
  };

  if (stats.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
        No priority data available
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
                'flex justify-start items-center text-sm py-1 w-full',
                priority === item.id && 'bg-accent',
              )}
              variant="ghost"
              size="lg"
              onClick={() => handleClick(item.id)}
            >
              <div className="flex items-center justify-between w-full">
                <span className={cn('font-medium', getPriorityColor(item.id))}>
                  {item.name}
                </span>
                <span className="text-sm text-accent-foreground">
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
