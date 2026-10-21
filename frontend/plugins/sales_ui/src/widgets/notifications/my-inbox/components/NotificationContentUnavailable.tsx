import type { NotificationContentUnavailableProps } from '~/widgets/notifications/my-inbox/types/notificationContent';
import { IconInfoCircle } from '@tabler/icons-react';
import { Empty } from 'erxes-ui';

export const NotificationContentUnavailable = ({
  title,
  description,
}: NotificationContentUnavailableProps) => (
  <div className="flex min-h-full items-center justify-center p-6">
    <Empty>
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconInfoCircle />
        </Empty.Media>
        <Empty.Title>{title}</Empty.Title>
        <Empty.Description>{description}</Empty.Description>
      </Empty.Header>
    </Empty>
  </div>
);
