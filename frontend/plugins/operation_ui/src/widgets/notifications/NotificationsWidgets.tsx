import { TaskDetails } from '@/task/components/detail/TaskDetails';
import { TaskDetailSheet } from '@/task/components/TaskDetailSheet';
import { lazy, Suspense } from 'react';
import { Button, Spinner } from 'erxes-ui';
import { IconExternalLink } from '@tabler/icons-react';
import { NotificationContent } from './contents/NotificationContent';
import { useTranslation } from 'react-i18next';
import { TNotification } from 'ui-modules';
import { Link } from 'react-router-dom';

const NotificationTaskAssignment = lazy(() =>
  import('./my-inbox/components/NotificationTaskAssignment').then((m) => ({
    default: m.NotificationTaskAssignment,
  })),
);

const NotificationProjectAssignment = lazy(() =>
  import('./my-inbox/components/NotificationProjectAssignment').then((m) => ({
    default: m.NotificationProjectAssignment,
  })),
);

const ProjectDetails = lazy(() =>
  import('@/project/components/details/ProjectDetails').then((m) => ({
    default: m.ProjectDetails,
  })),
);

const NotificationTeamContent = lazy(() =>
  import('./my-inbox/components/NotificationTeamContent').then((m) => ({
    default: m.NotificationTeamContent,
  })),
);

const TASK_INBOX_TITLES = new Set(['Task Assigned', 'Task Status changed']);
const PROJECT_INBOX_TITLES = new Set([
  'Project Assigned',
  'Project Status changed',
]);

const NotificationsWidgets = (props: TNotification) => {
  const { t } = useTranslation('operation');
  const { contentTypeId, contentType, title } = props;

  const [, moduleName, collectionType] = (contentType || '')
    .replace(':', '.')
    .split('.');

  if (moduleName === 'system' && collectionType) {
    const NotificationComponent =
      NotificationContent[collectionType as keyof typeof NotificationContent];

    if (!NotificationComponent) {
      return <div>{t('no-notification-component-found')}</div>;
    }

    return <NotificationComponent />;
  }

  if (!contentTypeId) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6">
        {t(
          'notification-content-unavailable',
          'Notification content unavailable',
        )}
      </div>
    );
  }

  if (moduleName === 'task' && TASK_INBOX_TITLES.has(title)) {
    return (
      <Suspense fallback={<Spinner containerClassName="h-full" />}>
        <NotificationTaskAssignment {...props} />
      </Suspense>
    );
  }

  if (moduleName === 'project') {
    if (PROJECT_INBOX_TITLES.has(title)) {
      return (
        <Suspense fallback={<Spinner containerClassName="h-full" />}>
          <NotificationProjectAssignment {...props} />
        </Suspense>
      );
    }

    return (
      <div className="h-full w-full overflow-auto">
        <div className="mx-auto flex max-w-3xl justify-end px-6 pt-6">
          <Button variant="secondary" asChild>
            <Link to={`/operation/projects/${contentTypeId}/overview`}>
              <IconExternalLink className="size-4" />
              {t('open-project', 'Open project')}
            </Link>
          </Button>
        </div>
        <Suspense fallback={<Spinner containerClassName="h-full" />}>
          <ProjectDetails projectId={contentTypeId} />
        </Suspense>
      </div>
    );
  }

  if (moduleName === 'team') {
    return (
      <Suspense fallback={<Spinner containerClassName="h-full" />}>
        <NotificationTeamContent {...props} />
      </Suspense>
    );
  }

  return (
    <div className="h-full w-full overflow-auto">
      <TaskDetailSheet />
      {moduleName === 'task' && (
        <div className="mx-auto flex max-w-3xl justify-end px-6 pt-6">
          <Button variant="secondary" asChild>
            <Link to={`/operation/tasks/${contentTypeId}`}>
              <IconExternalLink className="size-4" />
              {t('open-task', 'Open task')}
            </Link>
          </Button>
        </div>
      )}
      <TaskDetails taskId={contentTypeId} checkTriage={true} />
    </div>
  );
};

export default NotificationsWidgets;
