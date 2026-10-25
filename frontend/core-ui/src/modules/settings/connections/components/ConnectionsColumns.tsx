import { ColumnDef } from '@tanstack/table-core';
import { format } from 'date-fns';
import { Badge, Button, RecordTableInlineCell } from 'erxes-ui';
import { TFunction } from 'i18next';
import { useSetAtom } from 'jotai';
import { usePermissionCheck } from 'ui-modules';
import { ConnectionIcon } from '@/settings/connections/components/ConnectionIcon';
import { connectionSheetAtom } from '@/settings/connections/state';
import { IConnection, TConnectionStatus } from '@/settings/connections/types';

const STATUS_VARIANT: Record<
  TConnectionStatus,
  'success' | 'destructive' | 'warning' | 'secondary'
> = {
  verified: 'success',
  failed: 'destructive',
  incomplete: 'warning',
  ready: 'secondary',
};

const NameCell = ({ connection }: { connection: IConnection }) => {
  const setSheet = useSetAtom(connectionSheetAtom);
  const { hasActionPermission } = usePermissionCheck();
  const icon = (
    <ConnectionIcon
      icon={connection.icon}
      logo={connection.logo}
      name={connection.name}
    />
  );

  return (
    <RecordTableInlineCell className="gap-2">
      {hasActionPermission('manageConnections') ? (
        <Button
          variant="ghost"
          className="h-auto gap-2 px-1"
          aria-label={`Edit ${connection.name}`}
          onClick={() => setSheet({ mode: 'edit', connection })}
        >
          {icon}
          <span className="truncate">{connection.name}</span>
        </Button>
      ) : (
        <>
          {icon}
          <span className="truncate">{connection.name}</span>
        </>
      )}
    </RecordTableInlineCell>
  );
};

export const connectionsColumns = (
  t: TFunction,
): ColumnDef<IConnection>[] => {
  const statusLabel: Record<TConnectionStatus, string> = {
    verified: t('status-verified', 'Verified'),
    failed: t('status-failed', 'Failed'),
    incomplete: t('status-incomplete', 'Incomplete'),
    ready: t('status-ready', 'Not tested'),
  };

  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: t('name', 'Name'),
      size: 280,
      cell: ({ row }) => <NameCell connection={row.original} />,
    },
    {
      id: 'type',
      accessorKey: 'typeLabel',
      header: t('type', 'Type'),
      cell: ({ row }) => (
        <RecordTableInlineCell>{row.original.typeLabel}</RecordTableInlineCell>
      ),
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: t('status', 'Status'),
      cell: ({ row }) => (
        <RecordTableInlineCell>
          <Badge
            variant={STATUS_VARIANT[row.original.status]}
            title={row.original.lastTestMessage || undefined}
          >
            {statusLabel[row.original.status]}
          </Badge>
        </RecordTableInlineCell>
      ),
    },
    {
      id: 'updatedAt',
      accessorKey: 'updatedAt',
      header: t('updated', 'Updated'),
      cell: ({ row }) => (
        <RecordTableInlineCell>
          {row.original.updatedAt
            ? format(new Date(row.original.updatedAt), 'yyyy/MM/dd')
            : '-'}
        </RecordTableInlineCell>
      ),
    },
  ];
};
