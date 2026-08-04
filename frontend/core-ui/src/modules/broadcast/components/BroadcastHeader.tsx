import { BroadcastBreadcrumb } from '@/broadcast/components/BroadcastBreadcrumb';
import { IconSettings } from '@tabler/icons-react';
import { Button, Separator } from 'erxes-ui';
import { Can, PageHeader, createFavoriteBreadcrumb } from 'ui-modules';
import { BroadcastSheet } from './BroadcastSheet';
import { Link } from 'react-router';

export const BroadcastHeader = () => {
  const favoriteBreadcrumb = createFavoriteBreadcrumb('Broadcasts');

  return (
    <PageHeader>
      <PageHeader.Start>
        <BroadcastBreadcrumb />
        <Separator.Inline />
        <PageHeader.FavoriteToggleButton
          breadcrumb={favoriteBreadcrumb}
          icon="IconBroadcast"
        />
      </PageHeader.Start>

      <PageHeader.End>
        <Button variant="outline" asChild>
          <Link to="/settings/broadcast">
            <IconSettings />
            Go to settings
          </Link>
        </Button>
        <Can action="broadcastCreate">
          <BroadcastSheet />
        </Can>
      </PageHeader.End>
    </PageHeader>
  );
};
