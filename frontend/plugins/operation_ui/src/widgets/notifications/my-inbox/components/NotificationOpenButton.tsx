import type { NotificationOpenButtonProps } from '~/widgets/notifications/my-inbox/types/notificationContent';
import { IconExternalLink } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';

export const NotificationOpenButton = ({
  to,
  children,
}: NotificationOpenButtonProps): ReactElement => (
  <Button variant="secondary" className="shrink-0" asChild>
    <Link to={to}>
      <IconExternalLink className="size-4" />
      {children}
    </Link>
  </Button>
);
