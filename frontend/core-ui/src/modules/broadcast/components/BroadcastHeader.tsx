import { BroadcastBreadcrumb } from '@/broadcast/components/BroadcastBreadcrumb';
import { IconSettings } from '@tabler/icons-react';
import { Button, Separator } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { BroadcastSheet } from './BroadcastSheet';
import { Link } from 'react-router';

export const BroadcastHeader = () => {
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
            Go to settings
          </Link>
        </Button>
        <BroadcastSheet />
      </PageHeader.End>
    </PageHeader>
  );
};
