import { CellContext, ColumnDef } from '@tanstack/react-table';
import { RecordTable } from 'erxes-ui';
import { Popover, Command, Combobox } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { IIntegrationDetail } from '../types/Integration';
import { ArchiveIntegration } from '@/integrations/components/ArchiveIntegration';
import { RemoveIntegration } from '@/integrations/components/RemoveIntegration';
import { IntegrationType } from '@/types/Integration';
import { FacebookIntegrationRepair } from '../facebook/components/FacebookIntegrationRepair';
import { EMInstallScript } from '../erxes-messenger/components/EMInstallScript';
import { lazy, Suspense } from 'react';

const ErxesMessengerActions = lazy(() =>
  import('../erxes-messenger/components/ErxesMessengerDetail').then(
    (module) => ({
      default: module.ErxesMessengerActions,
    }),
  ),
);

const FacebookIntegrationActions = lazy(() =>
  import('../facebook/components/FacebookIntegrationDetail').then((module) => ({
    default: module.FacebookIntegrationActions,
  })),
);

const CallIntegrationActions = lazy(() =>
  import('../call/components/CallIntegrationDetail').then((module) => ({
    default: module.CallIntegrationActions,
  })),
);

const ImapIntegrationActions = lazy(() =>
  import('../imap/components/ImapIntegrationDetail').then((module) => ({
    default: module.ImapIntegrationActions,
  })),
);

export const IntegrationMoreColumnCell = ({
  cell,
}: {
  cell: CellContext<IIntegrationDetail, unknown>;
}) => {
  const { _id, name, isActive } = cell.row.original;
  const { integrationType } = useParams();

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item value="edit">
              <Suspense fallback={<div />}>
                {integrationType === IntegrationType.ERXES_MESSENGER && (
                  <ErxesMessengerActions cell={cell} />
                )}
                {(integrationType === IntegrationType.FACEBOOK_MESSENGER ||
                  integrationType === IntegrationType.FACEBOOK_POST) && (
                  <FacebookIntegrationActions cell={cell} />
                )}
                {integrationType === IntegrationType.CALL && (
                  <CallIntegrationActions cell={cell} />
                )}
                {integrationType === IntegrationType.IMAP && (
                  <ImapIntegrationActions cell={cell} />
                )}
              </Suspense>
            </Command.Item>
            {integrationType === IntegrationType.ERXES_MESSENGER && (
              <Command.Item value="install">
                <EMInstallScript integrationId={cell.row.original._id} />
              </Command.Item>
            )}
            {IntegrationType.FACEBOOK_MESSENGER === integrationType ||
            IntegrationType.FACEBOOK_POST === integrationType ? (
              <Command.Item value="repair">
                <FacebookIntegrationRepair cell={cell} />
              </Command.Item>
            ) : null}
            <Command.Item value="archive">
              <ArchiveIntegration _id={_id} name={name} isActive={isActive} />
            </Command.Item>
            <Command.Item value="remove">
              <RemoveIntegration _id={_id} name={name} />
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const integrationMoreColumn = (): ColumnDef<IIntegrationDetail> => ({
  id: 'more',
  cell: (cell: CellContext<IIntegrationDetail, unknown>) => (
    <IntegrationMoreColumnCell cell={cell} />
  ),
  size: 15,
});
