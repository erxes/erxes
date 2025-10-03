import { TaskDetails } from '@/task/components/detail/TaskDetails';
import { useGetTask } from '@/task/hooks/useGetTask';
import { taskDetailSheetState } from '@/task/states/taskDetailSheetState';
import { IconArrowsDiagonal } from '@tabler/icons-react';
import { Button, Separator, Sheet, TextOverflowTooltip } from 'erxes-ui';
import { useAtom } from 'jotai';
import { Link, useParams } from 'react-router-dom';

export const TaskDetailSheet = () => {
  const [activeTask, setActiveTask] = useAtom(taskDetailSheetState);

  return (
    <Sheet open={!!activeTask} onOpenChange={() => setActiveTask(null)}>
      <Sheet.View className="sm:max-w-screen-md">
        {activeTask && (
          <>
            <Sheet.Header>
              <TaskDetailSheetHeader />
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="overflow-y-auto">
              <TaskDetails taskId={activeTask} />
            </Sheet.Content>
          </>
        )}
      </Sheet.View>
    </Sheet>
  );
};

export const TaskDetailSheetHeader = () => {
  const { teamId, projectId } = useParams();
  const [activeTask, setActiveTask] = useAtom(taskDetailSheetState);
  const { task } = useGetTask({ variables: { _id: activeTask } });

  const url =
    teamId && !projectId
      ? `/operation/team/${teamId}/tasks/${activeTask}`
      : `/operation/tasks/${activeTask}`;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        asChild
        onClick={() => setActiveTask(null)}
      >
        <Link to={url}>
          <IconArrowsDiagonal className="text-accent-foreground" />
        </Link>
      </Button>
      <Separator.Inline />
      <Sheet.Title className="lg:max-w-xl max-w-[18rem] sm:max-w-sm truncate">
        <TextOverflowTooltip value={task?.name} />
      </Sheet.Title>
    </div>
  );
};
