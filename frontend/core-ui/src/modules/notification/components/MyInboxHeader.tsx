import { NotificationsFilters } from '@/notification/components/filter/NotificationsFilters';
import { NotificationSort } from '@/notification/components/NotificationSort';
import { IconInbox } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { NotificationDisplayOptions } from './NotificationDisplayOptions';
import { NotificationFilterBar } from './filter/NotificationFilterBar';

export const MyInboxHeader = () => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  return (
    <>
      <PageHeader>
        <PageHeader.Start>
          <Button variant="ghost" asChild>
            <Link to="/my-inbox">
              <IconInbox />
              {t('my-inbox')}
            </Link>
          </Button>
        </PageHeader.Start>
        <PageHeader.End>
          <NotificationsFilters />
          <NotificationSort />
          <NotificationDisplayOptions />
        </PageHeader.End>
      </PageHeader>
      <NotificationFilterBar />
    </>
  );
};
