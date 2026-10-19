import { MyInboxHeader } from '@/notification/components/MyInboxHeader';
import { NotificationList } from '@/notification/components/NotificationList';

export const Notifications = () => {
  return (
    <div className="flex flex-col h-full overflow-hidden w-full">
      <MyInboxHeader />
      <NotificationList />
    </div>
  );
};
