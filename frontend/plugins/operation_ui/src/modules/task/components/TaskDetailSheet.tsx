import { TaskDetails } from '@/task/components/detail/TaskDetails';
import { useGetTask } from '@/task/hooks/useGetTask';
import { taskDetailSheetState } from '@/task/states/taskDetailSheetState';
import { IconArrowsDiagonal } from '@tabler/icons-react';
import { Button, Separator, Sheet, TextOverflowTooltip } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { TaskDetailActions } from './task-actions/TaskDetailActions';

// Raw history.pushState (not react-router navigate) — the sheet and the
// TaskDetailPage full page both match `tasks/:taskId`, so a real navigate
// would unmount the list + sheet in favor of the full page.
const useTaskDetailSheetUrlSync = (
  activeTask: string | null,
  setActiveTask: (task: string | null) => void,
) => {
  const { teamId, projectId } = useParams();
  const listUrlRef = useRef<string | null>(null);
  const skipNextRevertRef = useRef(false);

  useEffect(() => {
    if (activeTask) {
      listUrlRef.current = window.location.pathname + window.location.search;
      const url =
        teamId && !projectId
          ? `/operation/team/${teamId}/tasks/${activeTask}`
          : `/operation/tasks/${activeTask}`;
      window.history.pushState({ taskSheet: activeTask }, '', url);
    } else if (listUrlRef.current) {
      if (!skipNextRevertRef.current) {
        window.history.pushState(null, '', listUrlRef.current);
      }
      skipNextRevertRef.current = false;
      listUrlRef.current = null;
    }
  }, [activeTask, teamId, projectId]);

  useEffect(() => {
    const onPopState = () => {
      skipNextRevertRef.current = true;
      setActiveTask(null);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [setActiveTask]);
};

export const TaskDetailSheet = () => {
  const [activeTask, setActiveTask] = useAtom(taskDetailSheetState);
  useTaskDetailSheetUrlSync(activeTask, setActiveTask);

  return (
    <Sheet open={!!activeTask} onOpenChange={() => setActiveTask(null)}>
      <Sheet.View className="sm:max-w-5xl">
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
      {task?._id && (
        <TaskDetailActions
          taskId={task._id}
        />
      )}
    </div>
  );
};
