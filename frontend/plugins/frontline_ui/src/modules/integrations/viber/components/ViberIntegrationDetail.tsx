import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Badge,
  Button,
  Empty,
  RecordTable,
  Sheet,
  Spinner,
  Skeleton,
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
import { ViberIntegrationActions } from './ViberIntegrationActions';
import { IconMessagesOff, IconPlus } from '@tabler/icons-react';
import { getViberConnectionStatus } from '../validation';

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
  const [saving, setSaving] = useState(false);
  const canRead = isLoaded && hasActionPermission('showIntegrations');
  const canAdd = isLoaded && hasActionPermission('integrationsAdd');
  const canEdit = isLoaded && hasActionPermission('integrationsEdit');
  const canRemove = isLoaded && hasActionPermission('integrationsRemove');
  const setup = useQuery<{ viberSetup: ViberSetup }>(VIBER_SETUP, {
    skip: !canRead,
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
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
        title: 'Unable to refresh integrations',
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
              ? `Remove “${row.name}”? This disconnects the bot. Existing conversations will remain, but you won’t be able to reply. Archive instead to keep the connection for later.`
              : `Archive “${row.name}”? New messages won’t be saved and replies will be paused until you restore it.`,
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
            ? 'Viber integration repaired'
            : action === 'remove'
            ? 'Viber integration removed'
            : 'Viber integration updated',
      });
    } catch (error) {
      toast({
        title: 'Unable to update integration',
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
      id: 'more',
      size: 33,
      cell: ({ row }) => (
        <ViberIntegrationActions
          archived={row.original.isActive === false}
          disabled={busy || saving}
          canEdit={canEdit}
          canRemove={canRemove}
          onEdit={() => setOpened(row.original)}
          onAction={(action) => void run(action, row.original)}
        />
      ),
    },
    {
      id: 'name',
      accessorKey: 'name',
      size: 300,
      header: t('name', { defaultValue: 'Name' }),
      cell: ({ row }) => (
        <Button
          variant="link"
          className="w-full min-w-0 justify-start px-0 text-left"
          disabled={busy || saving}
          onClick={() => setOpened(row.original)}
          title={row.original.name}
        >
          <span className="truncate">{row.original.name}</span>
        </Button>
      ),
    },
    {
      id: 'status',
      size: 110,
      header: t('status', { defaultValue: 'Status' }),
      cell: ({ row }) => (
        <Badge
          variant={row.original.isActive === false ? 'secondary' : 'success'}
        >
          {row.original.isActive === false ? 'Archived' : 'Active'}
        </Badge>
      ),
    },
    {
      id: 'healthStatus',
      size: 140,
      header: 'Webhook',
      cell: ({ row }) => {
        const status = getViberConnectionStatus(row.original.healthStatus);
        return <Badge variant={status.variant}>{status.label}</Badge>;
      },
    },
  ];

  if (!isLoaded) return <Spinner />;
  if (!canRead)
    return <p role="alert">You don’t have permission to view integrations.</p>;
  return (
    <div className="flex flex-col gap-5 flex-1 min-h-0 overflow-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">
          {t('integrations', { defaultValue: 'Integrations' })}
        </h3>
        {canAdd && (
          <Button
            disabled={
              busy ||
              saving ||
              setup.loading ||
              !setup.data ||
              Boolean(setup.data.viberSetup.webhookError)
            }
            onClick={() => setOpened('new')}
          >
            <IconPlus />
            {t('viber-add', { defaultValue: 'Add Viber integration' })}
          </Button>
        )}
      </div>
      <ViberSetupCheck
        setup={setup.data?.viberSetup}
        loading={setup.loading}
        error={setup.error?.message}
        refresh={() => void refresh()}
      />
      {list.error ? (
        <p role="alert" className="text-sm text-destructive">
          {list.error.message}{' '}
          <Button variant="link" onClick={() => void refresh()}>
            Try again
          </Button>
        </p>
      ) : list.loading && !list.integrations?.length ? (
        <div
          role="status"
          aria-label="Loading Viber integrations"
          className="space-y-3 py-4"
        >
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <span className="sr-only">Loading integrations</span>
        </div>
      ) : !list.integrations?.length ? (
        <Empty className="min-h-64 rounded-lg bg-accent/40">
          <Empty.Header>
            <Empty.Media>
              <IconMessagesOff
                className="size-8 text-muted-foreground"
                aria-hidden="true"
              />
            </Empty.Media>
            <Empty.Title>No Viber integrations</Empty.Title>
            <Empty.Description>
              {canAdd
                ? 'Connect a Viber bot to start receiving messages.'
                : 'Ask your administrator to connect a Viber bot.'}
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
            healthStatus: 'healthStatus' in row ? row.healthStatus : undefined,
          }))}
          tableId={`frontline_viber_${channelId}`}
          stickyColumns={['more', 'name']}
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
        onOpenChange={(open) => !open && !saving && setOpened(null)}
      >
        <Sheet.View
          className="sm:max-w-lg"
          onOpenAutoFocus={(event) => {
            if (canEdit || opened === 'new') event.preventDefault();
          }}
        >
          {opened && (
            <ViberIntegrationForm
              key={opened === 'new' ? 'new' : opened._id}
              channelId={channelId}
              integration={opened === 'new' ? undefined : opened}
              canEdit={opened === 'new' ? canAdd : canEdit}
              saving={saving}
              onSavingChange={setSaving}
              onClose={() => setOpened(null)}
            />
          )}
        </Sheet.View>
      </Sheet>
    </div>
  );
};
