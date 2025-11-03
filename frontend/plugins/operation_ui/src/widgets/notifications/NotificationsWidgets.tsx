import { TaskDetails } from '@/task/components/detail/TaskDetails';
import { NotificationContent } from './contents/NotificationContent';
import { TriageContent } from '@/triage/components/TriageContent';

const NotificationsWidgets = (props: any) => {
  const { contentTypeId, contentType } = props;

  const [_, moduleName, collectionType] = (contentType || '')
    .replace(':', '.')
    .split('.');

  if (moduleName === 'system' && collectionType) {
    const NotificationComponent =
      NotificationContent[collectionType as keyof typeof NotificationContent];

    if (!NotificationComponent) {
      return <></>;
    }

    return <NotificationComponent {...props} />;
  }
  if (moduleName === 'triage') {
    return <TriageContent triageId={contentTypeId} />;
  }

  return <TaskDetails taskId={contentTypeId} />;
};

export default NotificationsWidgets;
