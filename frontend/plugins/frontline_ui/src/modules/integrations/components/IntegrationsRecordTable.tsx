import { CellContext, ColumnDef } from '@tanstack/react-table';
import {
  Badge,
  Input,
  RecordTable,
  RecordTableInlineCell,
  PopoverScoped,
  Empty,
} from 'erxes-ui';
import { IIntegrationDetail } from '../types/Integration';
import { useIntegrations } from '../hooks/useIntegrations';
import { useParams } from 'react-router-dom';
import { useIntegrationEditField } from '@/integrations/hooks/useIntegrationEdit';
import { useState } from 'react';
import { InboxHotkeyScope } from '@/inbox/types/InboxHotkeyScope';
import clsx from 'clsx';
import { IntegrationType } from '@/types/Integration';
import { integrationMoreColumn } from './IntegrationMoreColumn';
import { IconMessagesOff } from '@tabler/icons-react';
import { INTEGRATIONS } from '../constants/integrations';

export const IntegrationsRecordTable = () => {
  const params = useParams();

  const { integrations, loading, handleFetchMore } = useIntegrations({
    variables: {
      kind: params?.integrationType,
      channelId: params?.id,
    },
    skip: !params?.integrationType,
    errorPolicy: 'all',
  });

  if (integrations?.length === 0) {
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
            {INTEGRATIONS[params?.integrationType as IntegrationType]?.name}{' '}
            found
          </Empty.Title>
          <Empty.Description>
            Get started by adding your first{' '}
            {INTEGRATIONS[params?.integrationType as IntegrationType]?.name}.
          </Empty.Description>
        </Empty.Header>
      </Empty>
    );
  }

  return (
    <RecordTable.Provider
      columns={integrationTypeColumns()}
      data={(integrations || []).filter((integration) => integration)}
      stickyColumns={['more', 'checkbox', 'name']}
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
    </RecordTable.Provider>
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

export const integrationTypeColumns = (): ColumnDef<IIntegrationDetail>[] => [
  integrationMoreColumn(),
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead label="Name" />,
    cell: (cell: CellContext<IIntegrationDetail, unknown>) => (
      <NameField cell={cell} />
    ),
    size: 300,
  },
  {
    id: 'isActive',
    accessorKey: 'isActive',
    header: () => <RecordTable.InlineHead label="Status" />,
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
    header: () => <RecordTable.InlineHead label="Health status" />,
    cell: (cell: CellContext<IIntegrationDetail, unknown>) => {
      const { status } = cell.getValue() as IIntegrationDetail['healthStatus'];

      return (
        <RecordTableInlineCell>
          <Badge
            className="text-xs capitalize mx-auto"
            variant={status === 'healthy' ? 'success' : 'destructive'}
          >
            {status}
          </Badge>
        </RecordTableInlineCell>
      );
    },
    size: 120,
  },
];
