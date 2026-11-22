import type { Broadcast } from '@erxes/core-contract';
import { IconSpeakerphone } from '@tabler/icons-react';
import { PageHeader, AppBreadcrumb } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { paths } from '~/lib/paths';
import { StatusBadge } from './BroadcastBits';

/** A broadcast page's top bar: where it is, its status, and `children` for the actions. */
export const BroadcastHeader = ({
  broadcast,
  children,
}: {
  broadcast: Broadcast;
  children?: ReactNode;
}) => {
  const { t } = useTranslation('broadcasts');

  return (
    <PageHeader>
      <PageHeader.Start>
        <AppBreadcrumb
          items={[
            { label: t('title', 'Broadcasts'), to: paths.broadcasts.list, icon: IconSpeakerphone },
            { label: broadcast.name, to: paths.broadcasts.broadcast(broadcast.id) },
          ]}
        />
        <StatusBadge status={broadcast.status} />
      </PageHeader.Start>
      <PageHeader.End>{children}</PageHeader.End>
    </PageHeader>
  );
};
