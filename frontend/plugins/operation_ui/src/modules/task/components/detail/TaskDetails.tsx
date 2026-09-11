import { TaskFields } from '@/task/components/detail/TaskFields';
import { TaskSideWidgets } from '~/widgets/relation/TaskSideWidgets';
import { TriageFields } from '@/triage/components/TriageFields';
import { useGetTask } from '@/task/hooks/useGetTask';
import { useGetTriage } from '@/triage/hooks/useGetTriage';
import { Empty, Spinner } from 'erxes-ui';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export const TaskDetails = ({
  taskId,
  checkTriage,
}: {
  taskId: string;
  checkTriage?: boolean;
}) => {
  const { t } = useTranslation('operation');
  const {
    task,
    loading: loadingTask,
    error: taskError,
  } = useGetTask({
    variables: { _id: taskId },
  });

  const {
    triage,
    loading: loadingTriage,
    error: triageError,
  } = useGetTriage({
    variables: { _id: taskId },
    skip: !checkTriage || loadingTask,
  });

  if (loadingTask || (checkTriage && loadingTriage)) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!task && !triage) {
    const error = taskError || triageError;

    return (
      <div className="flex min-h-dvh items-center justify-center p-6">
        <Empty>
          <Empty.Header>
            <Empty.Media variant="icon">
              <IconInfoCircle />
            </Empty.Media>
            <Empty.Title>
              {error
                ? t('failed-to-load-task', {
                    defaultValue: 'Failed to load task',
                  })
                : t('task-not-found', { defaultValue: 'Task not found' })}
            </Empty.Title>
            <Empty.Description>
              {error?.message ||
                t('task-no-longer-available', {
                  defaultValue:
                    'This task may have been removed or is no longer available.',
                })}
            </Empty.Description>
          </Empty.Header>
        </Empty>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex overflow-auto flex-1 lg:min-h-dvh">
      <div className="w-full xl:max-w-3xl mx-auto p-6">
        {task && <TaskFields task={task} />}
        {triage && <TriageFields triage={triage} />}
      </div>
      {task && <TaskSideWidgets contentId={task._id} />}
    </div>
  );
};
