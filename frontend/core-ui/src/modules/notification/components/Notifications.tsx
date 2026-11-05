import { MyInboxHeader } from '@/notification/components/MyInboxHeader';
import { NotificationList } from '@/notification/components/NotificationList';
import { NotificationStatusFilter } from '@/notification/components/filter/NotificationStatusFilter';

export const Notifications = () => {
  return (
    <div className="flex flex-col h-full overflow-hidden w-full">
      <MyInboxHeader />
      <NotificationStatusFilter />
      <NotificationList />
    </div>
  );
};
