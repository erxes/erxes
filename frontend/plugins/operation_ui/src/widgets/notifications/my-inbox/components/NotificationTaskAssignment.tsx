import { useGetTask } from '@/task/hooks/useGetTask';
import { IconChecklist } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { TNotification } from 'ui-modules';
import {
  AssignmentNotificationLayout,
  AssignmentUnavailable,
} from './AssignmentNotificationShared';

export const NotificationTaskAssignment = ({
  contentTypeId,
  title,
  fromUser,
  fromUserId,
  createdAt,
}: TNotification) => {
  const { t } = useTranslation('operation');
  const { task, loading, error } = useGetTask({
    variables: { _id: contentTypeId },
    skip: !contentTypeId,
  });

  const isAssigned = title === 'Task Assigned';
  const action = isAssigned ? 'assigned you to' : 'changed status on';

  if (!loading && !task) {
    return (
      <AssignmentUnavailable
        title={
          error
            ? t('failed-to-load-task', 'Failed to load task')
            : t('task-not-found', 'Task not found')
        }
        description={
          error?.message ||
          t(
            'task-no-longer-available',
            'This task may have been removed or is no longer available.',
          )
        }
      />
    );
  }

  return (
    <AssignmentNotificationLayout
      icon={
        <IconChecklist
          size={64}
          className="text-accent-foreground"
          stroke={1}
        />
      }
      kindLabel={t('task')}
      action={action}
      entityName={
        task?.name ||
        (task?.number != null ? `Task #${task.number}` : t('task', 'Task'))
      }
      loading={loading}
      createdAt={createdAt}
      openTo={task ? `/operation/tasks/${contentTypeId}` : undefined}
      openLabel={t('open-task', 'Open task')}
      fromUser={fromUser}
      fromUserId={fromUserId}
    />
  );
};
