import { CellContext, ColumnDef } from '@tanstack/react-table';
import {
  Badge,
  Button,
  CommandBar,
  Input,
  RecordTable,
  RecordTableInlineCell,
  PopoverScoped,
  Empty,
  Separator,
  Spinner,
  toast,
  Tooltip,
  TextOverflowTooltip,
  useConfirm,
} from 'erxes-ui';
import { useApolloClient, useMutation } from '@apollo/client';
import { IIntegrationDetail } from '../types/Integration';
import {
  INTEGRATIONS_PER_PAGE,
  useIntegrations,
} from '../hooks/useIntegrations';
import { useParams } from 'react-router-dom';
import { useIntegrationEditField } from '@/integrations/hooks/useIntegrationEdit';
import { lazy, Suspense, useEffect, useState } from 'react';
import { usePermissionCheck } from 'ui-modules';
import { InboxHotkeyScope } from '@/inbox/types/InboxHotkeyScope';
import clsx from 'clsx';
import { IntegrationType } from '@/types/Integration';
import { integrationMoreColumn } from './IntegrationMoreColumn';
import { REMOVE_INTEGRATION } from '@/integrations/graphql/mutations/RemoveIntegration';
import { IconMessagesOff, IconTrash } from '@tabler/icons-react';
import { INTEGRATIONS } from '../constants/integrations';
import { useTranslation } from 'react-i18next';

const FacebookIntegrationBotCell = lazy(() =>
  import(
    '~/widgets/automations/modules/facebook/components/bots/components/FacebookIntegrationBotCell'
  ).then((module) => ({ default: module.FacebookIntegrationBotCell })),
);

export const IntegrationsRecordTable = () => {
  const { t } = useTranslation('frontline');
  const params = useParams();
  const isDiscord =
    params?.integrationType === IntegrationType.DISCORD_MESSENGER;
  const isViber = params?.integrationType === IntegrationType.VIBER_MESSENGER;
  const { isLoaded, hasActionPermission } = usePermissionCheck();
  const canRead =
    !isViber || (isLoaded && hasActionPermission('showIntegrations'));
  const cursorPaginated = isDiscord || isViber;
  const columns = useIntegrationTypeColumns(isDiscord);
  const integrationName =
    INTEGRATIONS[params?.integrationType as keyof typeof INTEGRATIONS]?.name;

  const { integrations, loading, error, pageInfo, handleFetchMore } =
    useIntegrations({
      variables: {
        kind: params?.integrationType,
        channelId: params?.id,
        ...(cursorPaginated ? { limit: INTEGRATIONS_PER_PAGE } : {}),
      },
      skip: !params?.integrationType || !canRead,
      errorPolicy: 'all',
    });

  if (isViber && !isLoaded) return <Spinner />;
  if (!canRead)
    return (
      <p role="alert">
        {t('no-permission', {
          defaultValue: 'You don’t have permission to view integrations.',
        })}
      </p>
    );
  if (error && !integrations?.length)
    return (
      <p role="alert" className="text-sm text-destructive">
        {error.message}
      </p>
    );

  if (!integrations?.length && !loading) {
    return (
      <Empty className="w-full h-full rounded-lg bg-accent">
        <Empty.Header>
          <Empty.Media>
            <div className="rounded-sm border-dashed border-2 bg-muted flex items-center justify-center aspect-square w-20 text-muted-foreground">
              <IconMessagesOff />
            </div>
          </Empty.Media>
          <Empty.Title>
            {t('no-integration-found', {
              defaultValue: 'No {{name}} found',
              name: integrationName,
            })}
          </Empty.Title>
          <Empty.Description>
            {t('get-started-adding-integration', {
              defaultValue: 'Get started by adding your first {{name}}.',
              name: integrationName,
            })}
          </Empty.Description>
        </Empty.Header>
      </Empty>
    );
  }

  const table = (
    <RecordTable className="w-full">
      <RecordTable.Header />
      <RecordTable.Body>
        <RecordTable.CursorBackwardSkeleton handleFetchMore={handleFetchMore} />
        {loading && <RecordTable.RowSkeleton rows={40} />}
        <RecordTable.RowList />
        <RecordTable.CursorForwardSkeleton handleFetchMore={handleFetchMore} />
      </RecordTable.Body>
    </RecordTable>
  );

  return (
    <RecordTable.Provider
      columns={columns}
      data={(integrations || []).filter((integration) => integration)}
      tableId={`frontline_${params?.integrationType}_integrations_record_table`}
      stickyColumns={
        isDiscord ? ['more', 'checkbox', 'name'] : ['more', 'name']
      }
    >
      {cursorPaginated ? (
        <RecordTable.CursorProvider
          hasPreviousPage={pageInfo?.hasPreviousPage}
          hasNextPage={pageInfo?.hasNextPage}
          dataLength={integrations?.length}
          sessionKey={`frontline_integrations_${params?.integrationType}_${params?.id}`}
        >
          {table}
        </RecordTable.CursorProvider>
      ) : (
        <RecordTable.Scroll>{table}</RecordTable.Scroll>
      )}
      {isDiscord && <IntegrationsCommandBar />}
    </RecordTable.Provider>
  );
};

const IntegrationsCommandBar = () => {
  const { t } = useTranslation('frontline');
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const client = useApolloClient();
  const [removeIntegration, { loading }] = useMutation(REMOVE_INTEGRATION);

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const ids = selectedRows.map((row) => row.original._id as string);

  const handleDelete = () => {
    confirm({
      message: t('confirm-delete-selected-integrations', {
        defaultValue:
          "Delete {{count}} selected integrations? This can't be undone.",
        count: ids.length,
      }),
    }).then(async () => {
      let failed = 0;
      for (const id of ids) {
        try {
          await removeIntegration({ variables: { id } });
        } catch {
          failed += 1;
        }
      }

      table.resetRowSelection();

      let refreshFailed = false;
      try {
        const results = await client.refetchQueries({
          include: ['Integrations'],
        });
        refreshFailed = results.some(
          (result) => result.error || result.errors?.length,
        );
      } catch {
        refreshFailed = true;
      }

      const succeeded = ids.length - failed;
      const description = [
        failed
          ? t('integrations-removed-with-failures', {
              defaultValue: '{{succeeded}} removed, {{failed}} failed',
              succeeded,
              failed,
            })
          : t('integrations-removed', {
              defaultValue: '{{count}} integrations removed',
              count: succeeded,
            }),
        refreshFailed &&
          t('integrations-refresh-failed', {
            defaultValue:
              'Could not refresh the list. Reload the page to see the latest data.',
          }),
      ]
        .filter(Boolean)
        .join(' ');

      toast(
        failed || refreshFailed
          ? { title: t('error'), description, variant: 'destructive' }
          : { title: t('success'), description, variant: 'success' },
      );
    });
  };

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {t('n-selected', { count: selectedRows.length })}
        </CommandBar.Value>
        <Separator.Inline />
        <Button
          variant="secondary"
          className="text-destructive"
          disabled={loading}
          onClick={handleDelete}
        >
          {loading ? <Spinner /> : <IconTrash />}
          {t('delete')}
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};

const NameField = ({
  cell,
}: {
  cell: CellContext<IIntegrationDetail, unknown>;
}) => {
  const { t } = useTranslation('frontline');
  const { isLoaded, hasActionPermission } = usePermissionCheck();
  const [name, setName] = useState(cell.row.original.name);
  const isViber = cell.row.original.kind === IntegrationType.VIBER_MESSENGER;
  const canEdit =
    !isViber || (isLoaded && hasActionPermission('integrationsEdit'));
  useEffect(() => setName(cell.row.original.name), [cell.row.original.name]);
  const { editIntegrationField } = useIntegrationEditField(cell.row.original);
  const handleSave = () => {
    if (!canEdit) return;
    const value = isViber ? name.trim() : name;
    if (isViber && (!value || value.length > 100)) {
      setName(cell.row.original.name);
      toast({
        title: t('invalid-integration-name', {
          defaultValue: 'Enter a name between 1 and 100 characters.',
        }),
        variant: 'destructive',
      });
      return;
    }
    editIntegrationField(
      {
        variables: {
          name: value,
        },
        onError: (error) => {
          setName(cell.row.original.name);
          toast({ title: error.message, variant: 'destructive' });
        },
      },
      cell.row.original.name === value,
    );
  };
  if (cell.row.original.kind === IntegrationType.CALL || !canEdit) {
    return (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={name} />
      </RecordTableInlineCell>
    );
  }

  return (
    <PopoverScoped
      onOpenChange={(open) => {
        if (!open) {
          handleSave();
        }
      }}
      scope={clsx(
        InboxHotkeyScope.IntegrationSettingsPage,
        cell.row.original._id,
        'name',
      )}
      closeOnEnter
    >
      <RecordTableInlineCell.Trigger>
        <TextOverflowTooltip value={name} />
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

export const BrandField = () => {
  return null;
};

export const useIntegrationTypeColumns = (
  withSelection = false,
): ColumnDef<IIntegrationDetail>[] => {
  const { t } = useTranslation('frontline');
  const { integrationType } = useParams();

  return [
    integrationMoreColumn(withSelection),
    ...(withSelection
      ? [RecordTable.checkboxColumn as ColumnDef<IIntegrationDetail>]
      : []),
    {
      id: 'name',
      accessorKey: 'name',
      header: () => <RecordTable.InlineHead label={t('name')} />,
      cell: (cell: CellContext<IIntegrationDetail, unknown>) => (
        <NameField cell={cell} />
      ),
      size: 300,
    },
    {
      id: 'isActive',
      accessorKey: 'isActive',
      header: () => <RecordTable.InlineHead label={t('status')} />,
      cell: (cell: CellContext<IIntegrationDetail, unknown>) => {
        const status = cell.getValue() as boolean;
        return (
          <RecordTableInlineCell>
            <Badge
              className="text-xs capitalize mx-auto"
              variant={status ? 'success' : 'destructive'}
            >
              {status ? t('active', 'Active') : t('inactive', 'Inactive')}
            </Badge>
          </RecordTableInlineCell>
        );
      },
      size: 100,
    },
    {
      id: 'healthStatus',
      accessorKey: 'healthStatus',
      header: () => <RecordTable.InlineHead label={t('health-status')} />,
      cell: (cell: CellContext<IIntegrationDetail, unknown>) => {
        const healthStatus =
          cell.getValue() as IIntegrationDetail['healthStatus'];
        const status = healthStatus?.status;
        const error = healthStatus?.error;

        if (!status) {
          return <RecordTableInlineCell />;
        }

        const badge = (
          <Badge
            className="text-xs capitalize mx-auto"
            variant={status === 'healthy' ? 'success' : 'destructive'}
          >
            {status}
          </Badge>
        );

        return (
          <RecordTableInlineCell>
            {error ? (
              <Tooltip.Provider>
                <Tooltip delayDuration={0}>
                  <Tooltip.Trigger asChild>
                    <span className="mx-auto">{badge}</span>
                  </Tooltip.Trigger>
                  <Tooltip.Content className="max-w-80 whitespace-pre-wrap break-words">
                    {error}
                  </Tooltip.Content>
                </Tooltip>
              </Tooltip.Provider>
            ) : (
              badge
            )}
          </RecordTableInlineCell>
        );
      },
      size: 120,
    },
    ...(integrationType === IntegrationType.FACEBOOK_MESSENGER
      ? [
          {
            id: 'bot',
            header: () => <RecordTable.InlineHead label={t('bot')} />,
            cell: (cell: CellContext<IIntegrationDetail, unknown>) => (
              <Suspense fallback={<RecordTableInlineCell />}>
                <FacebookIntegrationBotCell
                  integrationId={cell.row.original._id}
                />
              </Suspense>
            ),
            size: 220,
          } as ColumnDef<IIntegrationDetail>,
        ]
      : []),
  ];
};
