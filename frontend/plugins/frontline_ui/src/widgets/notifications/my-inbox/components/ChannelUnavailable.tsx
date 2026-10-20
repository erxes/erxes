import type { ChannelUnavailableProps } from '~/widgets/notifications/my-inbox/types/notificationContent';
import { IconInfoCircle } from '@tabler/icons-react';
import { Empty } from 'erxes-ui';

export const ChannelUnavailable = ({
  description,
  title,
}: ChannelUnavailableProps) => (
  <Empty className="min-h-full rounded-none border-0">
    <Empty.Header>
      <Empty.Media variant="icon">
        <IconInfoCircle />
      </Empty.Media>
      <Empty.Title>{title}</Empty.Title>
      <Empty.Description>{description}</Empty.Description>
    </Empty.Header>
  </Empty>
);
