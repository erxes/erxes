import { TaskDetails } from '@/task/components/detail/TaskDetails';
import { TaskDetailSheet } from '@/task/components/TaskDetailSheet';
import { lazy, Suspense } from 'react';
import { Spinner } from 'erxes-ui';
import { NotificationContent } from './contents/NotificationContent';

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

const TASK_INBOX_TITLES = new Set(['Task Assigned', 'Task Status changed']);
const PROJECT_INBOX_TITLES = new Set([
  'Project Assigned',
  'Project Status changed',
]);

const NotificationsWidgets = (props: any) => {
  const { contentTypeId, contentType, title } = props;

  const [_, moduleName, collectionType] = (contentType || '')
    .replace(':', '.')
    .split('.');

  if (moduleName === 'system' && collectionType) {
    const NotificationComponent =
      NotificationContent[collectionType as keyof typeof NotificationContent];

    if (!NotificationComponent) {
      return <div>No notification component found</div>;
    }

    return <NotificationComponent {...props} />;
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
      <Suspense fallback={<Spinner containerClassName="h-full" />}>
        <ProjectDetails projectId={contentTypeId} />
      </Suspense>
    );
  }

  return (
    <>
      <TaskDetailSheet />
      <TaskDetails taskId={contentTypeId} checkTriage={true} />
    </>
  );
};

export default NotificationsWidgets;
