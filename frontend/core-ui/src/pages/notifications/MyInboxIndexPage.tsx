import { MyInboxLayout } from '@/notification/components/MyInboxLayout';
import { NotificationContent } from '@/notification/components/NotificationContent';
import { Notifications } from '@/notification/components/Notifications';
import { PageContainer } from 'erxes-ui';

export const MyInboxIndexPage = () => {
  return (
    <PageContainer>
      <MyInboxLayout
        Notifications={Notifications}
        NotificationContent={NotificationContent}
      />
    </PageContainer>
  );
};
