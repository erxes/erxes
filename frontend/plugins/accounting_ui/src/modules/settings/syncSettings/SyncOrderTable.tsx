import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
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

export const columns = (t: TFunction<'accounting'>): ColumnDef<IConfig>[] => [
  ...syncBaseColumns(t),
  {
    id: 'pos',
    accessorKey: 'pos',
    header: () => <RecordTable.InlineHead label={t('POS')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <PosSelect posId={cell.row.original.value?.posId} />
      </RecordTableInlineCell>
    ),
  },
];

export const SettingSyncOrderTable = () => {
  const { t } = useTranslation('accounting');
  return (
    <SyncConfigTable
      code={ACCOUNTING_SETTINGS_CODES.SYNC_ORDER}
      columns={columns(t)}
    />
  );
};
