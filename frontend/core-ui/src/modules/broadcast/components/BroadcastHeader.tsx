import { BroadcastBreadcrumb } from '@/broadcast/components/BroadcastBreadcrumb';
import { IconSettings } from '@tabler/icons-react';
import { Button, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Can, PageHeader } from 'ui-modules';
import { BroadcastSheet } from './BroadcastSheet';
import { Link } from 'react-router';

export const BroadcastHeader = () => {
  const { t } = useTranslation('broadcasts');
  return (
    <PageHeader>
      <PageHeader.Start>
        <BroadcastBreadcrumb />
        <Separator.Inline />
        <PageHeader.FavoriteToggleButton />
      </PageHeader.Start>

      <PageHeader.End>
        <Button variant="outline" asChild>
          <Link to="/settings/broadcast">
            <IconSettings />
            {t('go-to-settings', 'Go to settings')}
          </Link>
        </Button>
        <Can action="broadcastCreate">
          <BroadcastSheet />
        </Can>
      </PageHeader.End>
    </PageHeader>
  );
};
