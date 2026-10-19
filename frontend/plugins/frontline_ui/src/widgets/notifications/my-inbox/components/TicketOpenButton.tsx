import type { TicketOpenButtonProps } from '~/widgets/notifications/my-inbox/types/notificationContent';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { IconExternalLink } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

export const TicketOpenButton = ({ contentTypeId }: TicketOpenButtonProps) => {
  const { t } = useTranslation('frontline');

  return (
    <Button variant="secondary" asChild>
      <Link to={`/frontline/tickets?ticketId=${contentTypeId}`}>
        <IconExternalLink className="size-4" />
        {t('open-ticket', 'Open ticket')}
      </Link>
    </Button>
  );
};
