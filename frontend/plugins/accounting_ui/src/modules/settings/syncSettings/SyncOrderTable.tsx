import { useQuery } from '@apollo/client';
import { ColumnDef } from '@tanstack/table-core';
import { RecordTable, RecordTableInlineCell, useQueryState } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { ACCOUNTING_SETTINGS_CODES } from '../constants/settingsRoutes';
import { POS_DETAIL } from '../graphql/queries/relatedQueries';
import { useAccountingConfigs } from '../hooks/useAccountingConfigs';
import { accountingConfigDetailAtom } from '../states/accountingConfigState';
import { IConfig } from '../types/Config';
import { EditAccountingConfig } from './EditAccountingConfig';

export const SettingSyncOrderTable = () => {
  const { configs } = useAccountingConfigs({
    variables: { code: ACCOUNTING_SETTINGS_CODES.SYNC_ORDER },
  });
  return (
    <RecordTable.Provider
      columns={columns}
      data={configs || []}
      stickyColumns={['more', 'checkbox', 'code']}
    >
      <RecordTable>
        <RecordTable.Header />
        <RecordTable.Body>
          <RecordTable.RowList />
        </RecordTable.Body>
      </RecordTable>
      <EditAccountingConfig code={ACCOUNTING_SETTINGS_CODES.SYNC_ORDER} />
    </RecordTable.Provider>
  );
};

const PosSelect = ({ posId }: { posId: string }) => {
  const { data, loading } = useQuery(POS_DETAIL, {
    variables: { _id: posId },
    skip: !posId,
  });

  if (loading) {
    return null;
  }

  return (
    <span>{data?.posDetail?.name || ''}</span>
  );
};

const LinkCell = ({ row, renderVal }: { row: any; renderVal: string }) => {
  const [, setOpen] = useQueryState('configId', { defaultValue: '' });
  const setAccountDetail = useSetAtom(accountingConfigDetailAtom);
  return (
    <RecordTableInlineCell
      onClick={() => {
        setAccountDetail(row.original.value);
        setOpen(row.original._id);
      }}
    >
      {renderVal}
    </RecordTableInlineCell>
  );
};

export const columns: ColumnDef<IConfig>[] = [
  RecordTable.checkboxColumn as ColumnDef<IConfig>,
  {
    id: 'code',
    accessorKey: 'code',
    header: () => <RecordTable.InlineHead label="Код" />,
    cell: ({ cell }) => {
      return <LinkCell row={cell.row} renderVal={cell.row.original?.code} />;
    },
    size: 250,
  },
  {
    id: 'title',
    accessorKey: 'title',
    header: () => <RecordTable.InlineHead label="Гарчиг" />,
    cell: ({ cell }) => {
      return (
        <LinkCell row={cell.row} renderVal={cell.row.original?.value?.title} />
      );
    },
  },
  {
    id: 'pos',
    accessorKey: 'pos',
    header: () => <RecordTable.InlineHead label="POS" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <PosSelect
            posId={cell.row.original.value?.posId}
          />
        </RecordTableInlineCell>
      );
    },
  },
];
