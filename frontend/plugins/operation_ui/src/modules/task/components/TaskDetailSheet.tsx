import { TaskDetails } from '@/task/components/detail/TaskDetails';
import { useGetTask } from '@/task/hooks/useGetTask';
import { useTaskDetailSheet } from '@/task/hooks/useTaskDetailSheet';
import { TaskSideWidgets } from '~/widgets/relation/TaskSideWidgets';
import { IconAlertCircle, IconArrowsDiagonal, IconCloudExclamation } from '@tabler/icons-react';
import {
  Button,
  Empty,
  FocusSheet,
  ScrollArea,
  Separator,
  Sheet,
  TextOverflowTooltip,
} from 'erxes-ui';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TaskDetailActions } from './task-actions/TaskDetailActions';

const TaskDetailNotFoundState = () => {
  const { t } = useTranslation('operation');
  const [, setActiveTask] = useTaskDetailSheet();
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <Empty>
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconCloudExclamation />
          </Empty.Media>
          <Empty.Title>{t('task-not-found', 'Task not found')}</Empty.Title>
          <Empty.Description>
            {t('no-task-with-id', 'No task exists with this ID.')}
          </Empty.Description>
        </Empty.Header>
      </Empty>
      <Sheet.Close onClick={() => setActiveTask(null)} />
    </div>
  );
};

const TaskDetailErrorState = () => {
  const { t } = useTranslation('operation');
  const [, setActiveTask] = useTaskDetailSheet();
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <Empty>
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconAlertCircle />
          </Empty.Media>
          <Empty.Title>{t('error', 'Error')}</Empty.Title>
          <Empty.Description>
            {t('task-load-error', 'Failed to load the task.')}
          </Empty.Description>
        </Empty.Header>
      </Empty>
      <Sheet.Close onClick={() => setActiveTask(null)} />
    </div>
  );
};

export const TaskDetailSheet = () => {
  const [activeTask, setActiveTask] = useTaskDetailSheet();
  const { task, loading, error } = useGetTask({
    variables: { _id: activeTask },
    skip: !activeTask,
  });

  return (
    <FocusSheet open={!!activeTask} onOpenChange={() => setActiveTask(null)}>
      <FocusSheet.View
        loading={loading}
        error={!!error}
        notFound={!loading && !!activeTask && !task}
        errorState={<TaskDetailErrorState />}
        notFoundState={<TaskDetailNotFoundState />}
      >
        <Sheet.Header>
          <TaskDetailSheetHeader />
          <Sheet.Close />
        </Sheet.Header>
        <FocusSheet.Content>
          <ScrollArea className="flex-1 min-h-0">
            <div className="w-full p-6">
              {activeTask && <TaskDetails taskId={activeTask} />}
            </div>
          </ScrollArea>
          {task && (
            <TaskSideWidgets
              contentId={task._id}
              propertiesData={task.propertiesData}
            />
          )}
        </FocusSheet.Content>
      </FocusSheet.View>
    </FocusSheet>
  );
};

export const TaskDetailSheetHeader = () => {
  const { teamId, projectId } = useParams();
  const [activeTask, setActiveTask] = useTaskDetailSheet();
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
        <TaskDetailActions taskId={task._id} />
      )}
    </div>
  );
};