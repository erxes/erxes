import type { DealOpenButtonProps } from '~/widgets/notifications/my-inbox/types/notificationContent';
import { IconExternalLink } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { buildDealPath } from '~/widgets/notifications/my-inbox/utils/buildDealPath';

export const DealOpenButton = ({ deal }: DealOpenButtonProps) => {
  const { t } = useTranslation('sales');

  return (
    <Button variant="secondary" asChild>
      <Link to={buildDealPath(deal)}>
        <IconExternalLink className="size-4" />
        {t('open-deal', 'Open deal')}
      </Link>
    </Button>
  );
};
