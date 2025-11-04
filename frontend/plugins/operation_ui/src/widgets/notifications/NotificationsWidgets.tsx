import { TaskDetails } from '@/task/components/detail/TaskDetails';
import { NotificationContent } from './contents/NotificationContent';
import { TaskDetailSheet } from '@/task/components/TaskDetailSheet';

const NotificationsWidgets = (props: any) => {
  const { contentTypeId, contentType } = props;

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

  return (
    <div>
      <TaskDetailSheet />
      <TaskDetails taskId={contentTypeId} checkTriage={true} />
    </div>
  );
};

export default NotificationsWidgets;
