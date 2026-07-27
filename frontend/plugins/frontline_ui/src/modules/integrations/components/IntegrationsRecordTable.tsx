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
  useConfirm,
} from 'erxes-ui';
import { useApolloClient, useMutation } from '@apollo/client';
import { IIntegrationDetail } from '../types/Integration';
import { useIntegrations } from '../hooks/useIntegrations';
import { useParams } from 'react-router-dom';
import { useIntegrationEditField } from '@/integrations/hooks/useIntegrationEdit';
import { useState } from 'react';
import { InboxHotkeyScope } from '@/inbox/types/InboxHotkeyScope';
import clsx from 'clsx';
import { IntegrationType } from '@/types/Integration';
import { integrationMoreColumn } from './IntegrationMoreColumn';
import { REMOVE_INTEGRATION } from '@/integrations/graphql/mutations/RemoveIntegration';
import { IconMessagesOff, IconTrash } from '@tabler/icons-react';
import { INTEGRATIONS } from '../constants/integrations';
import { useTranslation } from 'react-i18next';

export const IntegrationsRecordTable = () => {
  const params = useParams();
  const isDiscord =
    params?.integrationType === IntegrationType.DISCORD_MESSENGER;
  const columns = useIntegrationTypeColumns(isDiscord);

  const { integrations, loading, handleFetchMore } = useIntegrations({
    variables: {
      kind: params?.integrationType,
      channelId: params?.id,
    },
    skip: !params?.integrationType,
    errorPolicy: 'all',
  });

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
            No{' '}
            {
              INTEGRATIONS[params?.integrationType as keyof typeof INTEGRATIONS]
                ?.name
            }{' '}
            found
          </Empty.Title>
          <Empty.Description>
            Get started by adding your first{' '}
            {
              INTEGRATIONS[params?.integrationType as keyof typeof INTEGRATIONS]
                ?.name
            }
            .
          </Empty.Description>
        </Empty.Header>
      </Empty>
    );
  }

  return (
    <RecordTable.Provider
      columns={columns}
      data={(integrations || []).filter((integration) => integration)}
      stickyColumns={
        isDiscord ? ['more', 'checkbox', 'name'] : ['more', 'name']
      }
    >
      <RecordTable.Scroll>
        <RecordTable className="w-full">
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            {loading && <RecordTable.RowSkeleton rows={40} />}
            <RecordTable.RowList />
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
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
      message: `Delete ${ids.length} selected integration(s)? This can't be undone.`,
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
      await client
        .refetchQueries({ include: ['Integrations'] })
        .catch(() => undefined);

      const succeeded = ids.length - failed;
      toast(
        failed
          ? {
              title: t('error'),
              description: `${succeeded} removed, ${failed} failed`,
              variant: 'destructive',
            }
          : {
              title: t('success'),
              variant: 'success',
              description: `${succeeded} integration(s) removed`,
            },
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
  const [name, setName] = useState(cell.row.original.name);
  const { editIntegrationField } = useIntegrationEditField(cell.row.original);
  const handleSave = () => {
    editIntegrationField(
      {
        variables: {
          name,
        },
      },
      cell.row.original.name === name,
    );
  };
  if (cell.row.original.kind === IntegrationType.CALL) {
    return <RecordTableInlineCell>{name}</RecordTableInlineCell>;
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
      <RecordTableInlineCell.Trigger>{name}</RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

export const BrandField = ({
  cell,
}: {
  cell: CellContext<IIntegrationDetail, unknown>;
}) => {
  return null;
};

export const useIntegrationTypeColumns = (
  withSelection = false,
): ColumnDef<IIntegrationDetail>[] => {
  const { t } = useTranslation('frontline');
  return [
    integrationMoreColumn(),
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
              {status ? 'Active' : 'Inactive'}
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

        return (
          <RecordTableInlineCell>
            {status ? (
              <Badge
                className="text-xs capitalize mx-auto"
                variant={status === 'healthy' ? 'success' : 'destructive'}
              >
                {status}
              </Badge>
            ) : null}
          </RecordTableInlineCell>
        );
      },
      size: 120,
    },
  ];
};
