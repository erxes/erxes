import { BroadcastBreadcrumb } from '@/broadcast/components/BroadcastBreadcrumb';
import { IconGraph, IconSettings } from '@tabler/icons-react';
import { Button, Separator } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { BroadcastSheet } from './BroadcastSheet';

export const BroadcastHeader = () => {
  return (
    <PageHeader>
      <PageHeader.Start>
        <BroadcastBreadcrumb />
        <Separator.Inline />
        <PageHeader.FavoriteToggleButton />
      </PageHeader.Start>

      <PageHeader.End>
        <Button variant="outline">
          <IconSettings />
          Go to settings
        </Button>
        <Button variant="outline">
          <IconGraph />
          Email summary
        </Button>
        <BroadcastSheet />
      </PageHeader.End>
    </PageHeader>
  );
};
