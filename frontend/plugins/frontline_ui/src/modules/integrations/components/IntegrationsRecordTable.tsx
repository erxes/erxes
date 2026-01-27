import { Cell, ColumnDef } from '@tanstack/react-table';
import {
  Badge,
  Input,
  RecordTable,
  RecordTableInlineCell,
  PopoverScoped,
} from 'erxes-ui';
import { IIntegrationDetail } from '../types/Integration';
import { useIntegrations } from '../hooks/useIntegrations';
import { useParams } from 'react-router-dom';
import { useIntegrationEditField } from '@/integrations/hooks/useIntegrationEdit';
import { useState } from 'react';
import { ArchiveIntegration } from '@/integrations/components/ArchiveIntegration';
import { RemoveIntegration } from '@/integrations/components/RemoveIntegration';
import { InboxHotkeyScope } from '@/inbox/types/InboxHotkeyScope';
import clsx from 'clsx';
import { IntegrationType } from '@/types/Integration';
import { FacebookIntegrationRepair } from '../facebook/components/FacebookIntegrationRepair';

export const IntegrationsRecordTable = ({
  Actions,
}: {
  Actions: (props: {
    cell: Cell<IIntegrationDetail, unknown>;
  }) => React.ReactNode;
}) => {
  const params = useParams();

  const { integrations, loading, handleFetchMore } = useIntegrations({
    variables: {
      kind: params?.integrationType,
      channelId: params?.id,
    },
    skip: !params?.integrationType,
    errorPolicy: 'all',
  });

  return (
    <RecordTable.Provider
      columns={integrationTypeColumns({ Actions })}
      data={(integrations || []).filter((integration) => integration)}
      stickyColumns={['name']}
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

const NameField = ({ cell }: { cell: Cell<IIntegrationDetail, unknown> }) => {
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
  cell: Cell<IIntegrationDetail, unknown>;
}) => {
  return <></>;
};

export const integrationTypeColumns = ({
  Actions,
}: {
  Actions: (props: {
    cell: Cell<IIntegrationDetail, unknown>;
  }) => React.ReactNode;
}): ColumnDef<IIntegrationDetail>[] => [
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead label="Name" />,
    cell: ({ cell }) => <NameField cell={cell} />,
    size: 300,
  },
  {
    id: 'isActive',
    accessorKey: 'isActive',
    header: () => <RecordTable.InlineHead label="Status" />,
    cell: ({ cell }) => {
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
    cell: ({ cell }) => {
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
  {
    id: 'action-group',
    header: () => <RecordTable.InlineHead label="Actions" />,
    cell: ({ cell }) => {
      const { isActive, _id, name } = cell.row.original;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { integrationType } = useParams();
      return (
        <RecordTableInlineCell>
          {IntegrationType.FACEBOOK_MESSENGER === integrationType ||
          IntegrationType.FACEBOOK_POST === integrationType ? (
            <FacebookIntegrationRepair cell={cell} />
          ) : null}
          <Actions cell={cell} />
          <ArchiveIntegration _id={_id} name={name} isActive={isActive} />
          <RemoveIntegration _id={_id} name={name} />
        </RecordTableInlineCell>
      );
    },
    size: 120,
  },
];
