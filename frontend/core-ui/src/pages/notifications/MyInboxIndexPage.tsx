import { MyInboxLayout } from '@/notification/my-inbox/components/MyInboxLayout';
import { NotificationContent } from '@/notification/my-inbox/components/NotificationContent';
import { Notifications } from '@/notification/my-inbox/components/Notifications';
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
