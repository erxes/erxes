import { useQuery } from '@apollo/client';
import { ColumnDef } from '@tanstack/table-core';
import { RecordTable, RecordTableInlineCell } from 'erxes-ui';
import { ACCOUNTING_SETTINGS_CODES } from '../constants/settingsRoutes';
import { POS_DETAIL } from '../graphql/queries/relatedQueries';
import { IConfig } from '../types/Config';
import { syncBaseColumns, SyncConfigTable } from './SyncTableShared';

const PosSelect = ({ posId }: { posId: string }) => {
  const { data, loading } = useQuery(POS_DETAIL, {
    variables: { _id: posId },
    skip: !posId,
  });

  if (loading) {
    return null;
  }

  return <span>{data?.posDetail?.name || ''}</span>;
};

export const columns: ColumnDef<IConfig>[] = [
  ...syncBaseColumns,
  {
    id: 'pos',
    accessorKey: 'pos',
    header: () => <RecordTable.InlineHead label="POS" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <PosSelect posId={cell.row.original.value?.posId} />
      </RecordTableInlineCell>
    ),
  },
];

export const SettingSyncOrderTable = () => (
  <SyncConfigTable code={ACCOUNTING_SETTINGS_CODES.SYNC_ORDER} columns={columns} />
);
