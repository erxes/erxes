import { NotificationContext } from '@/notification/context/NotificationContext';
import { NotificationDetail } from '@/notification/components/NotificationDetail';
import { NotificationToolbar } from '@/notification/components/NotificationToolbar';
import { useNotification } from '@/notification/hooks/useNotification';

export const NotificationContent = () => {
  const inbox = useNotification();

  return (
    <NotificationContext.Provider value={inbox}>
      <div className="flex h-full flex-col overflow-hidden">
        <NotificationToolbar />
        <NotificationDetail />
      </div>
    </NotificationContext.Provider>
  );
};
