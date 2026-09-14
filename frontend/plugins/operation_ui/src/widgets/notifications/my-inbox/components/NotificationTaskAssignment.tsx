import { useGetTask } from '@/task/hooks/useGetTask';
import {
  IconChecklist,
  IconExternalLink,
  IconInfoCircle,
} from '@tabler/icons-react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { Avatar, Button, Empty, readImage, Skeleton } from 'erxes-ui';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { TNotification } from 'ui-modules';

const formatDate = (isoDate: string) => {
  const date = parseISO(isoDate);
  if (isToday(date)) return `Today, ${format(date, 'HH:mm')}`;
  if (isYesterday(date)) return `Yesterday, ${format(date, 'HH:mm')}`;
  return format(date, 'yyyy-MM-dd HH:mm');
};

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
      <div className="flex min-h-dvh items-center justify-center p-6">
        <Empty>
          <Empty.Header>
            <Empty.Media variant="icon">
              <IconInfoCircle />
            </Empty.Media>
            <Empty.Title>
              {error
                ? t('failed-to-load-task', 'Failed to load task')
                : t('task-not-found', 'Task not found')}
            </Empty.Title>
            <Empty.Description>
              {error?.message ||
                t(
                  'task-no-longer-available',
                  'This task may have been removed or is no longer available.',
                )}
            </Empty.Description>
          </Empty.Header>
        </Empty>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto justify-center items-center h-full text-muted-foreground">
      <div className="size-36 bg-sidebar rounded-2xl border-2 border-dashed flex flex-col items-center justify-center">
        <IconChecklist
          size={64}
          className="text-accent-foreground"
          stroke={1}
        />
      </div>

      <p className="font-bold text-lg">{t('task')}</p>

      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-2">
          <Avatar className="size-6">
            <Avatar.Image
              src={readImage(fromUser?.details?.avatar || '')}
              alt={fromUser?.details?.fullName || ''}
            />
            <Avatar.Fallback className="rounded-lg">
              {fromUser?.details?.fullName?.[0]}
            </Avatar.Fallback>
          </Avatar>
          <span className="font-semibold text-foreground">
            {fromUser?.details?.fullName || fromUser?.email}
          </span>
        </div>

        <p className="text-foreground">
          {action}{' '}
          {loading ? (
            <Skeleton className="inline-block w-24 h-4 align-middle" />
          ) : (
            <span className="font-bold text-foreground">
              {task?.name ||
                (task?.number != null
                  ? `Task #${task.number}`
                  : t('task', 'Task'))}
            </span>
          )}
        </p>
      </div>

      {createdAt && (
        <p className="text-accent-foreground text-sm">
          {formatDate(createdAt)}
        </p>
      )}

      <div className="flex flex-wrap justify-center gap-2">
        {task && (
          <Button variant="secondary" asChild>
            <Link to={`/operation/tasks/${contentTypeId}`}>
              <IconExternalLink className="size-4" />
              {t('open-task', 'Open task')}
            </Link>
          </Button>
        )}
        {fromUserId && (
          <Button variant="secondary" asChild>
            <Link to={`/settings/team/members?user_id=${fromUserId}`}>
              {t('view')} {fromUser?.details?.fullName || fromUser?.email}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};
