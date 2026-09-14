import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Badge,
  Button,
  Empty,
  RecordTable,
  Sheet,
  Spinner,
  toast,
  useConfirm,
  EnumCursorDirection,
} from 'erxes-ui';
import { useState } from 'react';
import { usePermissionCheck } from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { ARCHIVE_INTEGRATION } from '@/integrations/graphql/mutations/ArchiveIntegration';
import { REMOVE_INTEGRATION } from '@/integrations/graphql/mutations/RemoveIntegration';
import { useIntegrations } from '@/integrations/hooks/useIntegrations';
import {
  VIBER_INTEGRATION_REFETCH,
  VIBER_REPAIR,
  VIBER_SETUP,
} from '../graphql';
import type { ViberIntegration, ViberSetup } from '../types';
import { ViberIntegrationForm } from './ViberIntegrationForm';
import { ViberSetupCheck } from './ViberSetupCheck';

export const ViberIntegrationDetail = ({
  channelId,
}: {
  channelId: string;
}) => {
  const { t } = useTranslation('frontline');
  const { isLoaded, hasActionPermission } = usePermissionCheck();
  const client = useApolloClient();
  const { confirm } = useConfirm();
  const [opened, setOpened] = useState<ViberIntegration | 'new' | null>(null);
  const [busy, setBusy] = useState(false);
  const canRead = isLoaded && hasActionPermission('showIntegrations');
  const canAdd = isLoaded && hasActionPermission('integrationsAdd');
  const canEdit = isLoaded && hasActionPermission('integrationsEdit');
  const canRemove = isLoaded && hasActionPermission('integrationsRemove');
  const setup = useQuery<{ viberSetup: ViberSetup }>(VIBER_SETUP, {
    skip: !canRead,
    fetchPolicy: 'network-only',
  });
  const list = useIntegrations({
    variables: { kind: 'viber-messenger', channelId, limit: 30 },
    skip: !canRead,
    notifyOnNetworkStatusChange: true,
  });
  const [repair] = useMutation(VIBER_REPAIR);
  const [archive] = useMutation(ARCHIVE_INTEGRATION);
  const [remove] = useMutation(REMOVE_INTEGRATION);

  const refresh = async (): Promise<void> => {
    try {
      await client.refetchQueries({
        include: [...VIBER_INTEGRATION_REFETCH, 'FrontlineViberSetup'],
      });
    } catch {
      toast({
        title: 'Could not refresh Viber settings',
        variant: 'destructive',
      });
    }
  };
  const run = async (
    action: 'repair' | 'archive' | 'remove',
    row: ViberIntegration,
  ): Promise<void> => {
    if (busy) return;
    if (
      action === 'remove' ||
      (action === 'archive' && row.isActive !== false)
    ) {
      try {
        await confirm({
          message:
            action === 'remove'
              ? `Remove “${row.name}”? This disconnects the webhook and removes the Viber connection and delivery mappings. Existing conversations will lose their Viber connection. Archive instead if you need to restore it later.`
              : `Archive “${row.name}”? New Viber messages will be acknowledged but not saved, and replies will be paused until it is restored.`,
        });
      } catch {
        return;
      }
    }
    setBusy(true);
    try {
      if (action === 'repair')
        await repair({ variables: { integrationId: row._id } });
      if (action === 'archive')
        await archive({
          variables: { id: row._id, status: row.isActive !== false },
        });
      if (action === 'remove') await remove({ variables: { id: row._id } });
      toast({
        title:
          action === 'repair'
            ? 'Viber webhook re-registered'
            : action === 'remove'
            ? 'Viber integration removed'
            : 'Viber integration updated',
      });
    } catch (error) {
      toast({
        title: 'Viber action failed',
        description:
          error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      await refresh();
      setBusy(false);
    }
  };
  const columns: ColumnDef<ViberIntegration>[] = [
    {
      accessorKey: 'name',
      size: 260,
      header: t('name', { defaultValue: 'Name' }),
      cell: ({ row }) => (
        <Button variant="link" onClick={() => setOpened(row.original)}>
          {row.original.name}
        </Button>
      ),
    },
    {
      id: 'status',
      size: 110,
      header: t('status', { defaultValue: 'Status' }),
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.original.isActive === false ? 'Archived' : 'Active'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      size: 340,
      header: t('actions', { defaultValue: 'Actions' }),
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={() => setOpened(row.original)}
          >
            {canEdit ? 'Manage' : 'Details'}
          </Button>
          {canEdit && (
            <>
              <Button
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={() => void run('repair', row.original)}
              >
                Repair
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={() => void run('archive', row.original)}
              >
                {row.original.isActive === false ? 'Restore' : 'Archive'}
              </Button>
            </>
          )}
          {canRemove && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              disabled={busy}
              onClick={() => void run('remove', row.original)}
            >
              Remove
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (!isLoaded) return <Spinner />;
  if (!canRead)
    return <p role="alert">You do not have permission to view integrations.</p>;
  return (
    <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-auto">
      <ViberSetupCheck
        setup={setup.data?.viberSetup}
        loading={setup.loading}
        error={setup.error?.message}
        refresh={() => void refresh()}
      />
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">
          {t('viber-connections', { defaultValue: 'Bot connections' })}
        </h3>
        {canAdd && (
          <Button
            disabled={
              busy ||
              setup.loading ||
              !setup.data ||
              Boolean(setup.data.viberSetup.webhookError)
            }
            onClick={() => setOpened('new')}
          >
            {t('viber-connect', { defaultValue: 'Connect Viber' })}
          </Button>
        )}
      </div>
      {list.error ? (
        <p role="alert" className="text-sm text-destructive">
          {list.error.message}{' '}
          <Button variant="link" onClick={() => void refresh()}>
            Try again
          </Button>
        </p>
      ) : list.loading && !list.integrations?.length ? (
        <Spinner />
      ) : !list.integrations?.length ? (
        <Empty className="min-h-44 bg-muted/30 rounded-lg border border-dashed">
          <Empty.Header>
            <Empty.Title>No Viber bots connected</Empty.Title>
            <Empty.Description>
              {canAdd
                ? 'Connect a bot to receive messages in this channel. A real bot token is required.'
                : 'Ask a user with integration-create permission to connect a bot.'}
            </Empty.Description>
          </Empty.Header>
        </Empty>
      ) : (
        <RecordTable.Provider
          columns={columns}
          data={(list.integrations || []).map((row) => ({
            _id: row._id,
            name: row.name,
            channelId: row.channelId,
            brandId: row.brandId,
            isActive: row.isActive !== false,
          }))}
          tableId={`frontline_viber_${channelId}`}
          stickyColumns={['name']}
        >
          <RecordTable.Scroll>
            <RecordTable>
              <RecordTable.Header />
              <RecordTable.Body>
                <RecordTable.RowList />
              </RecordTable.Body>
            </RecordTable>
          </RecordTable.Scroll>
          {list.pageInfo?.hasNextPage && (
            <Button
              variant="ghost"
              disabled={list.loading}
              onClick={() =>
                list.handleFetchMore({ direction: EnumCursorDirection.FORWARD })
              }
            >
              {list.loading ? <Spinner size="sm" /> : 'Load more'}
            </Button>
          )}
        </RecordTable.Provider>
      )}
      <Sheet
        open={Boolean(opened)}
        onOpenChange={(open) => !open && setOpened(null)}
      >
        <Sheet.View className="sm:max-w-xl">
          {opened && (
            <ViberIntegrationForm
              key={opened === 'new' ? 'new' : opened._id}
              channelId={channelId}
              integration={opened === 'new' ? undefined : opened}
              canEdit={opened === 'new' ? canAdd : canEdit}
              onClose={() => setOpened(null)}
            />
          )}
        </Sheet.View>
      </Sheet>
    </div>
  );
};
